import type {
  GetHelpChatbotConversationResponse,
  GetHelpChatbotConversationsQuery,
  GetHelpChatbotConversationsResponse,
  HelpChatbotConversationSummary,
  HelpChatbotTurnDetails,
} from '@common/types/helpChatbotAdmin'

import { ApplicationError } from '../../util/ApplicationError'
import { annotateTurns } from './annotateTurns'
import { Conditions, containsPattern, pricedTurns, select, toIso, toNumber } from './sql'

export const CONVERSATIONS_PAGE_SIZE = 25

// Postgres returns counts and sums as strings
type Numeric = string | number

type ConversationRow = Omit<
  HelpChatbotConversationSummary,
  'startedAt' | NumericKeys<HelpChatbotConversationSummary>
> & {
  startedAt: Date
  total: Numeric
  totalQuestions: Numeric
} & Record<NumericKeys<HelpChatbotConversationSummary>, Numeric>

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]

// A conversation is identified by its id and user together: the client makes up the id, so two users' ids can
// collide. The counts are of the turns within the date range.
export const getConversations = async (
  query: GetHelpChatbotConversationsQuery
): Promise<GetHelpChatbotConversationsResponse> => {
  const turnConditions = new Conditions().dateRange(query).withoutMockInProduction()
  const turns = pricedTurns(turnConditions)

  const conversationConditions = new Conditions()
  const replacements: Record<string, unknown> = { limit: CONVERSATIONS_PAGE_SIZE, offset: query.offset ?? 0 }
  if (query.search) {
    conversationConditions.add('c.matches_search')
    replacements.search = containsPattern(query.search)
  }
  // Looked up first, so the conversations needn't be joined with every user before they're filtered
  if (query.user) {
    const users = await select<{ id: string }>('SELECT id FROM users WHERE username ILIKE :user LIMIT 1000', {
      user: containsPattern(query.user),
    })
    if (users.length === 0) return { conversations: [], total: 0, totalQuestions: 0 }
    conversationConditions.add('c.matches_user')
    replacements.userIds = users.map(({ id }) => id)
  }
  const feedbackCondition = {
    any: null,
    down: 'c.down > 0',
    comment: 'c.comments > 0',
    up: 'c.up > 0',
    none: 'c.up + c.down = 0',
  }[query.feedback ?? 'any']
  if (feedbackCondition) conversationConditions.add(feedbackCondition)
  const problemCondition = {
    any: null,
    empty: 'c.empty > 0',
    failed: 'c.failed > 0',
    aborted: 'c.aborted > 0',
    cutOff: 'c.cut_off > 0',
  }[query.problems ?? 'any']
  if (problemCondition) conversationConditions.add(problemCondition)

  // The page is picked from the aggregates alone. Only its rows get their first question and usernames,
  // which kept a 90-day list over 200 000 turns from sorting every conversation's questions and joining every user.
  const rows = await select<ConversationRow>(
    `
    WITH ${turns.sql},
    conversations AS (
      SELECT
        t.conversation_id,
        t.user_id,
        min(t.created_at) AS started_at,
        count(*) AS questions,
        count(*) FILTER (WHERE t.rating = 'up') AS up,
        count(*) FILTER (WHERE t.rating = 'down') AS down,
        count(*) FILTER (WHERE t.feedback_comment IS NOT NULL) AS comments,
        count(*) FILTER (WHERE t.status = 'empty') AS empty,
        count(*) FILTER (WHERE t.status = 'failed') AS failed,
        count(*) FILTER (WHERE t.status = 'aborted') AS aborted,
        count(*) FILTER (WHERE t.status = 'answered' AND t.finish_reason = 'length') AS cut_off,
        coalesce(sum(t.prompt_tokens + t.completion_tokens), 0) AS total_tokens,
        coalesce(sum(t.input_cost + t.cached_cost + t.output_cost + t.reasoning_cost), 0) AS cost,
        ${query.search ? 'bool_or(t.question ILIKE :search OR t.answer ILIKE :search)' : 'TRUE'} AS matches_search,
        ${query.user ? "bool_or(t.user_id IN (:userIds) OR t.metadata->>'impersonatedUserId' IN (:userIds))" : 'TRUE'} AS matches_user
      FROM turns t
      GROUP BY t.conversation_id, t.user_id
    ),
    page AS (
      SELECT c.*, count(*) OVER () AS total, sum(c.questions) OVER () AS total_questions
      FROM conversations c
      WHERE ${conversationConditions.toSql()}
      ORDER BY c.started_at DESC, c.conversation_id, c.user_id
      LIMIT :limit OFFSET :offset
    )
    SELECT
      c.conversation_id AS "conversationId",
      c.user_id AS "userId",
      u.username AS "username",
      iu.username AS "impersonatedUsername",
      c.started_at AS "startedAt",
      first.metadata AS "metadata",
      first.question AS "firstQuestion",
      c.questions, c.up, c.down, c.comments, c.empty, c.failed, c.aborted,
      c.cut_off AS "cutOff",
      c.total_tokens AS "totalTokens",
      c.cost,
      c.total AS "total",
      c.total_questions AS "totalQuestions"
    FROM page c
    CROSS JOIN LATERAL (
      SELECT f.question, f.metadata
      FROM help_chatbot_turns f
      WHERE f.conversation_id = c.conversation_id AND f.user_id IS NOT DISTINCT FROM c.user_id
      ORDER BY f.created_at
      LIMIT 1
    ) first
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN users iu ON iu.id = first.metadata->>'impersonatedUserId'
    ORDER BY c.started_at DESC, c.conversation_id, c.user_id
    `,
    { ...turns.replacements, ...conversationConditions.replacements, ...replacements }
  )

  const conversations = rows.map(
    ({
      startedAt,
      questions,
      up,
      down,
      comments,
      empty,
      failed,
      aborted,
      cutOff,
      totalTokens,
      cost,
      total,
      totalQuestions,
      ...row
    }): HelpChatbotConversationSummary => ({
      ...row,
      startedAt: toIso(startedAt),
      questions: toNumber(questions),
      up: toNumber(up),
      down: toNumber(down),
      comments: toNumber(comments),
      empty: toNumber(empty),
      failed: toNumber(failed),
      aborted: toNumber(aborted),
      cutOff: toNumber(cutOff),
      totalTokens: toNumber(totalTokens),
      cost: toNumber(cost),
    })
  )

  return {
    conversations,
    total: toNumber(rows[0]?.total ?? 0),
    totalQuestions: toNumber(rows[0]?.totalQuestions ?? 0),
  }
}

type TurnRow = Omit<
  HelpChatbotTurnDetails,
  'number' | 'followsNumber' | 'inHistory' | 'retriedAsNumber' | 'createdAt' | 'cost' | 'feedbackReviewedAt'
> & {
  previousTurnId: string | null
  createdAt: Date
  feedbackReviewedAt: Date | null
  cost: Numeric | null
  username: string | null
}

// Every turn of one conversation, annotated with what the model saw. A 404 if there are none.
export const getConversation = async (
  conversationId: string,
  userId: string | null
): Promise<GetHelpChatbotConversationResponse> => {
  const conditions = new Conditions().add('t.conversation_id = :conversationId', { conversationId })
  if (userId === null) conditions.add('t.user_id IS NULL')
  else conditions.add('t.user_id = :userId', { userId })
  const turns = pricedTurns(conditions)

  const rows = await select<TurnRow>(
    `
    WITH ${turns.sql}
    SELECT
      t.id, t.previous_turn_id AS "previousTurnId", t.created_at AS "createdAt", t.status, t.metadata,
      t.question, t.answer, u.username, iu.username AS "impersonatedUsername",
      t.finish_reason AS "finishReason", t.deployment, t.model, t.git_sha AS "gitSha",
      t.prompt_tokens AS "promptTokens", t.cached_tokens AS "cachedTokens",
      t.completion_tokens AS "completionTokens", t.reasoning_tokens AS "reasoningTokens",
      t.duration_ms AS "durationMs", t.input_cost + t.cached_cost + t.output_cost + t.reasoning_cost AS "cost",
      t.rating, t.feedback_comment AS "feedbackComment", t.feedback_reviewed_at AS "feedbackReviewedAt"
    FROM turns t
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN users iu ON iu.id = t.metadata->>'impersonatedUserId'
    ORDER BY t.created_at, t.id
    `,
    turns.replacements
  )
  if (rows.length === 0) throw ApplicationError.NotFound('Conversation not found')

  return {
    conversationId,
    userId,
    username: rows[0].username,
    turns: annotateTurns(rows).map(
      ({ previousTurnId, username, createdAt, feedbackReviewedAt, cost, ...turn }): HelpChatbotTurnDetails => ({
        ...turn,
        createdAt: toIso(createdAt),
        feedbackReviewedAt: feedbackReviewedAt === null ? null : toIso(feedbackReviewedAt),
        cost: cost === null ? null : toNumber(cost),
      })
    ),
  }
}
