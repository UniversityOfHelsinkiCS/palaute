export const MAX_QUESTION_LENGTH = 500

export const MAX_FEEDBACK_COMMENT_LENGTH = 1000

// Only answered turns can be part of a history. empty: no content, but the tokens were billed. failed: the request
// to the model failed. aborted: the client went away.
export const TURN_STATUSES = ['pending', 'answered', 'empty', 'failed', 'aborted'] as const
