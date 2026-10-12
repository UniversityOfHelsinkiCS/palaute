import type { LanguageId } from './common'

// Wire format of the help chatbot's backend. Used by the client's HelpChatbot/helpChatbotService.ts
// and the server's routes/helpChatbot. See "Backend" in documentation/help_chatbot.md.

export type HelpChatbotRating = 'up' | 'down'

// POST /help-chatbot/messages
export type PostHelpChatbotMessageBody = {
  conversationId: string
  // The id of the last answer the user was shown, null for the first question. The server builds the history
  // from it, so an answer the user never saw, e.g. to a request that failed on the way back, isn't part of it.
  previousTurnId: string | null
  // The UI language, so the answers quote the labels the user sees
  language: LanguageId
  question: string
}

export type PostHelpChatbotMessageResponse = {
  // id identifies the turn, for previousTurnId and feedback. content is markdown.
  message: { id: string; role: 'assistant'; content: string }
}

// PUT /help-chatbot/messages/:id/feedback, replacing any earlier feedback. A null rating removes it.
// Only a thumbs down takes a comment.
export type PutHelpChatbotFeedbackBody = { rating: HelpChatbotRating | null; comment?: string }
