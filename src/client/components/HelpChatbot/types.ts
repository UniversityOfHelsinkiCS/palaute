// The chat's own model. Independent of the backend's wire format, which only api.ts knows.

export type UserEntry = { id: string; role: 'user'; text: string; status: 'waiting' | 'answered' | 'failed' }

export type Rating = 'up' | 'down'

// Saved feedback on an answer. After a thumbs down, an optional comment is asked for until it's sent or skipped.
// The comment's draft is kept here, so closing the chat doesn't lose it.
export type Feedback = { rating: Rating | null; comment: 'asking' | 'sent' | null; commentDraft: string }

// id is the backend's id for the answer
export type AssistantEntry = { id: string; role: 'assistant'; markdown: string; feedback: Feedback }

export type ChatEntry = UserEntry | AssistantEntry
