import type { TURN_STATUSES } from '../helpChatbot'
import type { LanguageId } from './common'

// Wire format of the help chatbot's backend, and a turn's status and metadata, which the admin viewer's
// wire format uses too. Used by the client's HelpChatbot/helpChatbotService.ts and the server's
// routes/helpChatbot. See "Backend" in documentation/help_chatbot.md.

export type HelpChatbotRating = 'up' | 'down'

export type HelpChatbotTurnStatus = (typeof TURN_STATUSES)[number]

// Context saved with each turn (help_chatbot_turns.metadata), shown in the viewer when present. Every key is
// optional and {} is valid. The database takes any object, so turns saved by older code may have keys this
// type doesn't list; the viewer shows those as they are.
export type HelpChatbotTurnMetadata = {
  // The UI language the question was asked in, which the answer's labels follow
  uiLanguage?: LanguageId
  // During "login as", the user the admin was viewing Norppa as
  impersonatedUserId?: string
}

// POST /help-chatbot/turns
export type PostHelpChatbotTurnBody = {
  conversationId: string
  // The id of the last answer the user was shown, null for the first question. The server builds the history
  // from it, so an answer the user never saw, e.g. to a request that failed on the way back, isn't part of it.
  previousTurnId: string | null
  // The UI language, so the answers quote the labels the user sees
  language: LanguageId
  question: string
}

// id is the turn's, for previousTurnId and feedback. answer is markdown.
export type PostHelpChatbotTurnResponse = { id: string; answer: string }

// PUT /help-chatbot/turns/:id/feedback, replacing any earlier feedback. A null rating removes it.
// Only a thumbs down takes a comment.
export type PutHelpChatbotFeedbackBody = { rating: HelpChatbotRating | null; comment?: string }
