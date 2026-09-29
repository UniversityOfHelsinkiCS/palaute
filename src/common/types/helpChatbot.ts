import type { LanguageId } from './common'

// Wire format of the help chatbot's backend. Used by the client's HelpChatbot/helpChatbotService.ts
// and the server's routes/helpChatbot. See "Backend" in documentation/help_chatbot.md.

export type HelpChatbotRole = 'user' | 'assistant'

export type HelpChatbotTurn = {
  role: HelpChatbotRole
  content: string
}

// POST /help-chatbot/messages
export type PostHelpChatbotMessageBody = {
  conversationId: string
  // The UI language, so the answers quote the labels the user sees
  language: LanguageId
  // Answered history, with the new question last
  messages: HelpChatbotTurn[]
}

export type PostHelpChatbotMessageResponse = {
  // content is markdown
  message: { id: string; role: 'assistant'; content: string }
}
