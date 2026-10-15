import type { LanguageId } from '@common/types/common'
import type { HelpChatbotRating } from '@common/types/helpChatbot'

import z from 'zod/v4'

import { MAX_FEEDBACK_COMMENT_LENGTH, MAX_QUESTION_LENGTH } from '../../../common/helpChatbot'
import { ApplicationError } from '../../util/ApplicationError'

const parse = <T extends z.ZodType>(schema: T, body: unknown): z.output<T> => {
  const result = schema.safeParse(body)
  if (!result.success) throw ApplicationError.BadRequest(z.prettifyError(result.error))
  return result.data
}

const TurnBodySchema = z.object({
  conversationId: z.string().min(1).max(100),
  previousTurnId: z.uuid().nullable(),
  language: z.enum(['fi', 'sv', 'en']),
  question: z.string().min(1).max(MAX_QUESTION_LENGTH),
})

export type HelpChatbotTurnRequest = {
  conversationId: string
  previousTurnId: string | null
  language: LanguageId
  question: string
}

export const parseHelpChatbotRequest = (body: unknown): HelpChatbotTurnRequest => {
  // Spelled out because the server isn't strict, so zod types a nullable field as optional
  const { conversationId, previousTurnId, language, question } = parse(TurnBodySchema, body)
  return { conversationId, previousTurnId: previousTurnId ?? null, language, question }
}

const FeedbackBodySchema = z
  .object({
    rating: z.enum(['up', 'down']).nullable(),
    comment: z.string().trim().min(1).max(MAX_FEEDBACK_COMMENT_LENGTH).optional(),
  })
  .refine(({ rating, comment }) => comment === undefined || rating === 'down', 'Only a thumbs down takes a comment')

export type HelpChatbotFeedback = { rating: HelpChatbotRating | null; comment: string | null }

export const parseHelpChatbotFeedback = (body: unknown): HelpChatbotFeedback => {
  const { rating, comment } = parse(FeedbackBodySchema, body)
  return { rating, comment: comment ?? null }
}
