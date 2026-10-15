import type { HelpChatbotTurnMetadata, HelpChatbotTurnStatus } from '@common/types/helpChatbot'

import { randomUUID } from 'crypto'
import { Op } from 'sequelize'
import z from 'zod/v4'

import type { Completion } from './azureCompletion'
import type { ChatMessage } from './history'
import type { HelpChatbotFeedback } from './parseRequest'

import { HelpChatbotTurn } from '../../models/helpChatbotTurn'
import { ApplicationError } from '../../util/ApplicationError'
import { GIT_SHA } from '../../util/config'
import { buildHistory } from './history'

// The only module that writes help_chatbot_turns. An answer is saved even if the client has gone away, since its
// tokens were billed.

// A 400 unless previousTurnId is an answered turn of this user's conversation, so nobody can continue someone
// else's
export const loadHistory = async (
  userId: string,
  conversationId: string,
  previousTurnId: string | null
): Promise<ChatMessage[]> => {
  if (previousTurnId === null) return []

  const turns = await HelpChatbotTurn.findAll({
    where: {
      conversationId,
      userId,
      status: 'answered',
      question: { [Op.ne]: null },
      answer: { [Op.ne]: null },
    },
    attributes: ['id', 'previousTurnId', 'question', 'answer'],
  })
  const history = buildHistory(
    turns.map(({ id, previousTurnId: previous, question, answer }) => ({
      id,
      previousTurnId: previous,
      question,
      answer,
    })),
    previousTurnId
  )
  if (!history) throw ApplicationError.BadRequest('Unknown previousTurnId')
  return history
}

type NewTurn = {
  userId: string
  metadata: HelpChatbotTurnMetadata
  deployment: string | null
  conversationId: string
  previousTurnId: string | null
  question: string
}

// Saved before the model is called, so failed and aborted questions are recorded too
export const createTurn = (turn: NewTurn) =>
  HelpChatbotTurn.create({
    ...turn,
    id: randomUUID(),
    answer: null,
    status: 'pending',
    finishReason: null,
    model: null,
    gitSha: GIT_SHA || null,
    promptTokens: null,
    cachedTokens: null,
    completionTokens: null,
    reasoningTokens: null,
    durationMs: null,
    rating: null,
    feedbackComment: null,
    feedbackReviewedAt: null,
  })

export const setTurnStatus = (turn: HelpChatbotTurn, status: Extract<HelpChatbotTurnStatus, 'failed' | 'aborted'>) =>
  turn.update({ status })

export const saveCompletion = async (
  turn: HelpChatbotTurn,
  { deployment, model, content, finishReason, usage }: Completion,
  durationMs: number
): Promise<Extract<HelpChatbotTurnStatus, 'answered' | 'empty'>> => {
  const status = content.trim() === '' ? 'empty' : 'answered'
  await turn.update({
    status,
    answer: status === 'answered' ? content : null,
    finishReason,
    deployment,
    model,
    promptTokens: usage?.promptTokens ?? null,
    cachedTokens: usage?.cachedTokens ?? null,
    completionTokens: usage?.completionTokens ?? null,
    reasoningTokens: usage?.reasoningTokens ?? null,
    durationMs,
  })
  return status
}

// Replaces any earlier feedback, which makes it unreviewed again. A 404 unless the turn is an answer to this user.
export const saveFeedback = async (turnId: string, userId: string, { rating, comment }: HelpChatbotFeedback) => {
  // Anything else would make the query fail on the uuid column
  if (!z.uuid().safeParse(turnId).success) throw ApplicationError.NotFound()

  const [count] = await HelpChatbotTurn.update(
    { rating, feedbackComment: comment, feedbackReviewedAt: null },
    { where: { id: turnId, userId, status: 'answered' } }
  )
  if (count === 0) throw ApplicationError.NotFound()
}
