import type { TURN_STATUSES } from '../helpChatbot'
import type { LanguageId } from './common'

export type HelpChatbotRating = 'up' | 'down'

export type HelpChatbotTurnStatus = (typeof TURN_STATUSES)[number]

// The column takes any object, so saved turns may have keys this type doesn't list
export type HelpChatbotTurnMetadata = {
  uiLanguage?: LanguageId
  // During "login as", the user being viewed as; the turn's userId is the admin
  impersonatedUserId?: string
}

// POST /help-chatbot/turns
export type PostHelpChatbotTurnBody = {
  conversationId: string
  // The last answer the user was shown, so the history leaves out answers they never saw
  previousTurnId: string | null
  // The UI language, for the labels the answer quotes
  language: LanguageId
  question: string
}

// answer is markdown
export type PostHelpChatbotTurnResponse = { id: string; answer: string }

// PUT /help-chatbot/turns/:id/feedback. A null rating removes the feedback; only a thumbs down takes a comment.
export type PutHelpChatbotFeedbackBody = { rating: HelpChatbotRating | null; comment?: string }
