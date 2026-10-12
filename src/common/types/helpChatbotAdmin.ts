import type { LanguageId } from './common'
import type { HelpChatbotRating } from './helpChatbot'

// Wire format of the NorppAI viewer, the admin tab for reading saved help chatbot conversations.
// Served by the server's routes/helpChatbot/adminController.ts under /admin/norppai.
// See "Viewer" in documentation/help_chatbot.md.

export type NorppaiTurnStatus = 'pending' | 'answered' | 'empty' | 'failed' | 'aborted'

// Context saved with each turn (help_chatbot_turns.metadata), shown in the viewer when present. Every key is
// optional and {} is valid. The database takes any object, so turns saved by older code may have keys this
// type doesn't list; the viewer shows those as they are.
export type HelpChatbotTurnMetadata = {
  // The UI language the question was asked in, which the answer's labels follow
  uiLanguage?: LanguageId
  // During "login as", the user the admin was viewing Norppa as
  impersonatedUserId?: string
}

// A turn's metadata as read back: anything the database holds
export type NorppaiMetadata = Record<string, unknown>

// € per million tokens, from validFrom (inclusive) to validTo (exclusive, null while current).
// family is the model without Azure's version date, e.g. gpt-5-mini for gpt-5-mini-2025-08-07.
export type NorppaiPrice = {
  family: string
  validFrom: string
  validTo: string | null
  input: number
  cachedInput: number
  output: number
}

// In euros, by token type: uncached input, cached input, output without the reasoning, and reasoning (billed at
// the output price). unpricedTurns counts turns with token usage but no price, which aren't in the sums.
export type NorppaiCost = {
  input: number
  cachedInput: number
  output: number
  reasoning: number
  total: number
  unpricedTurns: number
}

// GET /admin/norppai/meta
export type GetNorppaiMetaResponse = {
  // Thumbs downs no admin has marked reviewed
  newFeedbackCount: number
  prices: NorppaiPrice[]
}

// Dates are YYYY-MM-DD days in Helsinki time, both inclusive
export type NorppaiDateRange = { from: string; to: string }

export type NorppaiFeedbackFilter = 'any' | 'down' | 'comment' | 'up' | 'none'

export type NorppaiProblemFilter = 'any' | 'empty' | 'failed' | 'aborted' | 'cutOff'

// GET /admin/norppai/conversations. Omitted fields don't filter. Outside production, turns answered by the
// mock are included, as they are in the other views.
export type GetNorppaiConversationsQuery = NorppaiDateRange & {
  search?: string
  feedback?: NorppaiFeedbackFilter
  problems?: NorppaiProblemFilter
  user?: string
  offset?: number
}

// The counts are of the turns within the date range
export type NorppaiConversationSummary = {
  conversationId: string
  userId: string | null
  username: string | null
  startedAt: string
  // Of the first turn, with the impersonated user's username looked up
  metadata: NorppaiMetadata
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

export type GetNorppaiConversationsResponse = {
  conversations: NorppaiConversationSummary[]
  // Of all pages
  total: number
  totalQuestions: number
}

export type NorppaiTurn = {
  id: string
  // 1-based, in the order asked
  number: number
  createdAt: string
  status: NorppaiTurnStatus
  question: string | null
  answer: string | null
  metadata: NorppaiMetadata
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

// GET /admin/norppai/conversation?conversationId=&userId= (no userId: a conversation whose user was cleared)
export type GetNorppaiConversationResponse = {
  conversationId: string
  userId: string | null
  username: string | null
  turns: NorppaiTurn[]
}

export type NorppaiRatingFilter = 'down' | 'up' | 'both'

// GET /admin/norppai/feedback
export type GetNorppaiFeedbackQuery = Partial<NorppaiDateRange> & {
  rating?: NorppaiRatingFilter
  withComment?: boolean
  hideReviewed?: boolean
}

export type NorppaiFeedbackItem = {
  turnId: string
  conversationId: string
  userId: string | null
  username: string | null
  createdAt: string
  metadata: NorppaiMetadata
  status: NorppaiTurnStatus
  finishReason: string | null
  rating: HelpChatbotRating
  comment: string | null
  reviewedAt: string | null
  question: string | null
  answer: string | null
  gitSha: string | null
}

export type GetNorppaiFeedbackResponse = {
  items: NorppaiFeedbackItem[]
  // True when there were more than the newest items returned
  truncated: boolean
}

// PUT /admin/norppai/turns/:id/reviewed
export type PutNorppaiReviewedBody = { reviewed: boolean }

export type NorppaiUsageGrouping = 'day' | 'week' | 'month'

// GET /admin/norppai/usage
export type GetNorppaiUsageQuery = NorppaiDateRange & { groupBy?: NorppaiUsageGrouping }

export type NorppaiUsage = {
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
  cost: NorppaiCost
}

export type GetNorppaiUsageResponse = {
  totals: NorppaiUsage & { conversations: number }
  // Every period in the range, also empty ones. start is the period's first day.
  periods: (NorppaiUsage & { start: string })[]
  // Newest first
  versions: (NorppaiUsage & { gitSha: string | null; models: string[]; firstAt: string; lastAt: string })[]
  prices: NorppaiPrice[]
}
