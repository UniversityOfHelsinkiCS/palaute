// Placeholder wire format, expected to change with the real backend. Used only by the client's
// HelpChatbot/helpChatbotService.ts and its mock.

export type HelpChatbotRole = 'user' | 'assistant'

export type HelpChatbotTurn = {
  role: HelpChatbotRole
  content: string
}

// POST /help-chatbot/messages
export type PostHelpChatbotMessageBody = {
  conversationId: string
  // Answered history, with the new question last
  messages: HelpChatbotTurn[]
}

export type PostHelpChatbotMessageResponse = {
  // content is markdown
  message: { id: string; role: 'assistant'; content: string }
}
