// The chat's own model. Independent of the backend's wire format, which only helpChatbotService.ts knows.

export type UserEntry = { id: string; role: 'user'; text: string; status: 'waiting' | 'answered' | 'failed' }

export type AssistantEntry = { id: string; role: 'assistant'; markdown: string }

export type ChatEntry = UserEntry | AssistantEntry
