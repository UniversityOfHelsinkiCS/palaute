import type { HelpChatbotRating, HelpChatbotTurnStatus } from './helpChatbot'

// Wire format of the NorppAI viewer, the admin tab for reading saved help chatbot conversations.
// Served by the server's routes/helpChatbot/adminController.ts under /admin/help-chatbot.
// See "Viewer" in documentation/help_chatbot.md.

// A turn's metadata as read back: anything the database holds, unlike HelpChatbotTurnMetadata, which is
// what the code writes
export type HelpChatbotSavedMetadata = Record<string, unknown>

// € per million tokens, from validFrom (inclusive) to validTo (exclusive, null while current).
// family is the model without Azure's version date, e.g. gpt-5-mini for gpt-5-mini-2025-08-07.
export type HelpChatbotPrice = {
  family: string
  validFrom: string
  validTo: string | null
  input: number
  cachedInput: number
  output: number
}

// In euros, by token type: uncached input, cached input, output without the reasoning, and reasoning (billed at
// the output price). unpricedTurns counts turns with token usage but no price, which aren't in the sums.
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
  // Thumbs downs no admin has marked reviewed
  newFeedbackCount: number
  prices: HelpChatbotPrice[]
}

// Dates are YYYY-MM-DD days in Helsinki time, both inclusive
export type HelpChatbotDateRange = { from: string; to: string }

export type HelpChatbotFeedbackFilter = 'any' | 'down' | 'comment' | 'up' | 'none'

export type HelpChatbotProblemFilter = 'any' | 'empty' | 'failed' | 'aborted' | 'cutOff'

// GET /admin/help-chatbot/conversations. Omitted fields don't filter. Outside production, turns answered by the
// mock are included, as they are in the other views.
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
  // Of the first turn, with the impersonated user's username looked up
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
  // Whether the turn is part of the conversation the user saw: answered and on the chain to the latest answer
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
  // True when there were more than the newest items returned
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
