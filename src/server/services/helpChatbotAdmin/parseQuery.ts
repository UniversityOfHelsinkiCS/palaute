import type {
  GetHelpChatbotConversationsQuery,
  GetHelpChatbotFeedbackQuery,
  GetHelpChatbotUsageQuery,
  PutHelpChatbotReviewedBody,
} from '@common/types/helpChatbotAdmin'

import z from 'zod/v4'

import { parseInput } from '../../util/parseInput'

const day = z.iso.date()

// Query parameters arrive as strings
const booleanParam = z
  .enum(['true', 'false'])
  .optional()
  .transform(value => (value === undefined ? undefined : value === 'true'))

// An empty text doesn't filter
const textParam = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform(value => value || undefined)

const inOrder = ({ from, to }: { from?: string; to?: string }) => !from || !to || from <= to

const ConversationsQuerySchema = z
  .object({
    from: day,
    to: day,
    search: textParam,
    feedback: z.enum(['any', 'down', 'comment', 'up', 'none']).optional(),
    problems: z.enum(['any', 'empty', 'failed', 'aborted', 'cutOff']).optional(),
    user: textParam,
    offset: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .refine(inOrder, 'from must not be after to')

export const parseConversationsQuery = (query: unknown): GetHelpChatbotConversationsQuery =>
  parseInput(ConversationsQuerySchema, query)

const ConversationKeySchema = z.object({
  conversationId: z.string().min(1).max(100),
  userId: z.string().min(1).max(100).optional(),
})

export const parseConversationKey = (query: unknown): { conversationId: string; userId: string | null } => {
  const { conversationId, userId } = parseInput(ConversationKeySchema, query)
  return { conversationId, userId: userId ?? null }
}

const FeedbackQuerySchema = z
  .object({
    from: day.optional(),
    to: day.optional(),
    rating: z.enum(['down', 'up', 'both']).optional(),
    withComment: booleanParam,
    hideReviewed: booleanParam,
  })
  .refine(inOrder, 'from must not be after to')

export const parseFeedbackQuery = (query: unknown): GetHelpChatbotFeedbackQuery =>
  parseInput(FeedbackQuerySchema, query)

const UsageQuerySchema = z
  .object({
    from: day,
    to: day,
    groupBy: z.enum(['day', 'week', 'month']).optional(),
  })
  .refine(inOrder, 'from must not be after to')

export const parseUsageQuery = (query: unknown): GetHelpChatbotUsageQuery => parseInput(UsageQuerySchema, query)

const ReviewedBodySchema = z.object({ reviewed: z.boolean() })

export const parseReviewedBody = (body: unknown): PutHelpChatbotReviewedBody => parseInput(ReviewedBodySchema, body)
