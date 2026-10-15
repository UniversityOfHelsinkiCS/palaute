import type {
  GetHelpChatbotFeedbackQuery,
  GetHelpChatbotFeedbackResponse,
  GetHelpChatbotMetaResponse,
  HelpChatbotFeedbackItem,
} from '@common/types/helpChatbotAdmin'

import z from 'zod/v4'

import { HelpChatbotTurn } from '../../models/helpChatbotTurn'
import { ApplicationError } from '../../util/ApplicationError'
import { PRICES } from './prices'
import { Conditions, select, toIso, toNumber } from './sql'

const FEEDBACK_LIMIT = 500

type FeedbackRow = Omit<HelpChatbotFeedbackItem, 'createdAt' | 'reviewedAt'> & {
  createdAt: Date
  reviewedAt: Date | null
}

// Newest first, by when the answer was given: feedback is almost always given right after
export const getFeedback = async (query: GetHelpChatbotFeedbackQuery): Promise<GetHelpChatbotFeedbackResponse> => {
  const conditions = new Conditions().add('t.rating IS NOT NULL').dateRange(query).withoutMockInProduction()
  const rating = query.rating ?? 'down'
  if (rating !== 'both') conditions.add('t.rating = :rating', { rating })
  if (query.withComment) conditions.add('t.feedback_comment IS NOT NULL')
  if (query.hideReviewed) conditions.add('t.feedback_reviewed_at IS NULL')

  const rows = await select<FeedbackRow>(
    `
    SELECT
      t.id AS "turnId", t.conversation_id AS "conversationId", t.user_id AS "userId", u.username,
      t.created_at AS "createdAt", t.metadata, t.status, t.finish_reason AS "finishReason", t.rating,
      t.feedback_comment AS "comment", t.feedback_reviewed_at AS "reviewedAt", t.question, t.answer,
      t.git_sha AS "gitSha"
    FROM help_chatbot_turns t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE ${conditions.toSql()}
    ORDER BY t.created_at DESC, t.id
    LIMIT :limit
    `,
    { ...conditions.replacements, limit: FEEDBACK_LIMIT + 1 }
  )

  return {
    items: rows.slice(0, FEEDBACK_LIMIT).map(({ createdAt, reviewedAt, ...row }) => ({
      ...row,
      createdAt: toIso(createdAt),
      reviewedAt: reviewedAt === null ? null : toIso(reviewedAt),
    })),
    truncated: rows.length > FEEDBACK_LIMIT,
  }
}

// Only rated turns can be reviewed. saveFeedback clears the mark when the feedback changes.
export const setReviewed = async (turnId: string, reviewed: boolean) => {
  // Anything else would make the query fail on the uuid column
  if (!z.uuid().safeParse(turnId).success) throw ApplicationError.NotFound()

  const [count] = await HelpChatbotTurn.update(
    { feedbackReviewedAt: reviewed ? new Date() : null },
    { where: { id: turnId, rating: ['up', 'down'] } }
  )
  if (count === 0) throw ApplicationError.NotFound()
}

export const getMeta = async (): Promise<GetHelpChatbotMetaResponse> => {
  const conditions = new Conditions()
    .add("t.rating = 'down'")
    .add('t.feedback_reviewed_at IS NULL')
    .withoutMockInProduction()
  const [{ count }] = await select<{ count: string | number }>(
    `SELECT count(*) AS count FROM help_chatbot_turns t WHERE ${conditions.toSql()}`,
    conditions.replacements
  )
  return { newFeedbackCount: toNumber(count), prices: PRICES }
}
