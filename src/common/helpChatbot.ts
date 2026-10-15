// Constants shared by the help chatbot's client and server

export const MAX_QUESTION_LENGTH = 500

export const MAX_FEEDBACK_COMMENT_LENGTH = 1000

// pending: waiting for the model. answered: has an answer, so it can be part of a conversation's history.
// empty: the model returned no content, but the tokens were billed. failed: the request to the model failed.
// aborted: the client went away before the answer arrived.
export const TURN_STATUSES = ['pending', 'answered', 'empty', 'failed', 'aborted'] as const
