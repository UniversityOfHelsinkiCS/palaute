import type { HelpChatbotRating, HelpChatbotTurnStatus } from './helpChatbot'

// Metadata as read back: older turns may hold keys HelpChatbotTurnMetadata no longer lists
export type HelpChatbotSavedMetadata = Record<string, unknown>

// € per million tokens. validFrom is inclusive, validTo exclusive and null while current.
// family is the model without Azure's version date, e.g. gpt-5-mini
export type HelpChatbotPrice = {
  family: string
  validFrom: string
  validTo: string | null
  input: number
  cachedInput: number
  output: number
}

// In euros. output excludes the reasoning, which is billed at the output price. unpricedTurns have usage but
// no price, and aren't in the sums.
export type HelpChatbotCost = {
  input: number
  cachedInput: number
  output: number
  reasoning: number
  total: number
  unpricedTurns: number
}

// GET /admin/help-chatbot/meta
export type GetHelpChatbotMetaResponse = {
  // Unreviewed thumbs downs
  newFeedbackCount: number
  prices: HelpChatbotPrice[]
}

// Dates are YYYY-MM-DD days in Helsinki time, both inclusive
export type HelpChatbotDateRange = { from: string; to: string }

export type HelpChatbotFeedbackFilter = 'any' | 'down' | 'comment' | 'up' | 'none'

export type HelpChatbotProblemFilter = 'any' | 'empty' | 'failed' | 'aborted' | 'cutOff'

// GET /admin/help-chatbot/conversations. Omitted fields don't filter.
export type GetHelpChatbotConversationsQuery = HelpChatbotDateRange & {
  search?: string
  feedback?: HelpChatbotFeedbackFilter
  problems?: HelpChatbotProblemFilter
  user?: string
  offset?: number
}

// The counts are of the turns within the date range
export type HelpChatbotConversationSummary = {
  conversationId: string
  userId: string | null
  username: string | null
  startedAt: string
  // The first turn's
  metadata: HelpChatbotSavedMetadata
  impersonatedUsername: string | null
  firstQuestion: string | null
  questions: number
  up: number
  down: number
  comments: number
  empty: number
  failed: number
  aborted: number
  cutOff: number
  totalTokens: number
  cost: number
}

export type GetHelpChatbotConversationsResponse = {
  conversations: HelpChatbotConversationSummary[]
  // Of all pages
  total: number
  totalQuestions: number
}

export type HelpChatbotTurnDetails = {
  id: string
  // 1-based, in the order asked
  number: number
  createdAt: string
  status: HelpChatbotTurnStatus
  question: string | null
  answer: string | null
  metadata: HelpChatbotSavedMetadata
  impersonatedUsername: string | null
  finishReason: string | null
  deployment: string | null
  model: string | null
  gitSha: string | null
  promptTokens: number | null
  cachedTokens: number | null
  completionTokens: number | null
  reasoningTokens: number | null
  durationMs: number | null
  // null without usage or a price
  cost: number | null
  rating: HelpChatbotRating | null
  feedbackComment: string | null
  feedbackReviewedAt: string | null
  // The number of the turn this question followed
  followsNumber: number | null
  // Answered and on the chain to the latest answer, i.e. part of what the user saw
  inHistory: boolean
  // For a question that got no answer, the turn that asked it again
  retriedAsNumber: number | null
}

// GET /admin/help-chatbot/conversation?conversationId=&userId= (no userId: a conversation whose user was cleared)
export type GetHelpChatbotConversationResponse = {
  conversationId: string
  userId: string | null
  username: string | null
  turns: HelpChatbotTurnDetails[]
}

export type HelpChatbotRatingFilter = 'down' | 'up' | 'both'

// GET /admin/help-chatbot/feedback
export type GetHelpChatbotFeedbackQuery = Partial<HelpChatbotDateRange> & {
  rating?: HelpChatbotRatingFilter
  withComment?: boolean
  hideReviewed?: boolean
}

export type HelpChatbotFeedbackItem = {
  turnId: string
  conversationId: string
  userId: string | null
  username: string | null
  createdAt: string
  metadata: HelpChatbotSavedMetadata
  status: HelpChatbotTurnStatus
  finishReason: string | null
  rating: HelpChatbotRating
  comment: string | null
  reviewedAt: string | null
  question: string | null
  answer: string | null
  gitSha: string | null
}

export type GetHelpChatbotFeedbackResponse = {
  items: HelpChatbotFeedbackItem[]
  // More items matched than were returned
  truncated: boolean
}

// PUT /admin/help-chatbot/turns/:id/reviewed
export type PutHelpChatbotReviewedBody = { reviewed: boolean }

export type HelpChatbotUsageGrouping = 'day' | 'week' | 'month'

// GET /admin/help-chatbot/usage
export type GetHelpChatbotUsageQuery = HelpChatbotDateRange & { groupBy?: HelpChatbotUsageGrouping }

export type HelpChatbotUsage = {
  questions: number
  answered: number
  empty: number
  failed: number
  aborted: number
  pending: number
  up: number
  down: number
  // Turns with token usage, i.e. answered or empty
  billed: number
  promptTokens: number
  cachedTokens: number
  completionTokens: number
  reasoningTokens: number
  // Of the billed turns
  avgDurationMs: number | null
  cost: HelpChatbotCost
}

export type GetHelpChatbotUsageResponse = {
  totals: HelpChatbotUsage & { conversations: number }
  // Every period in the range, also empty ones. start is the period's first day.
  periods: (HelpChatbotUsage & { start: string })[]
  // Newest first
  versions: (HelpChatbotUsage & { gitSha: string | null; models: string[]; firstAt: string; lastAt: string })[]
  prices: HelpChatbotPrice[]
}
