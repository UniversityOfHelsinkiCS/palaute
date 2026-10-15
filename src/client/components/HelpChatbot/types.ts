// The chat's own model, independent of the backend's wire format

export type UserEntry = { id: string; role: 'user'; text: string; status: 'waiting' | 'answered' | 'failed' }

export type Rating = 'up' | 'down'

// The comment's draft is kept here, so closing the chat doesn't lose it
export type Feedback = { rating: Rating | null; comment: 'asking' | 'sent' | null; commentDraft: string }

// id is the answer's turn id
export type AssistantEntry = { id: string; role: 'assistant'; markdown: string; feedback: Feedback }

export type ChatEntry = UserEntry | AssistantEntry
