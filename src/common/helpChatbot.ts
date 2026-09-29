// Limits shared by the help chatbot's client and server

export const MAX_QUESTION_LENGTH = 500

// Characters of conversation sent to the model. Keeps the request body well under the server's 100 kB JSON limit
// and bounds what a forged history can add to the prompt.
export const MAX_HISTORY_LENGTH = 30_000

// The newest turns whose content fits in MAX_HISTORY_LENGTH. The latest turn is always kept.
// The client trims before sending and the server trims again, so a long conversation never fails.
export const trimHistory = <T extends { content: string }>(turns: T[]): T[] => {
  let length = 0
  let start = turns.length
  while (start > 0) {
    length += turns[start - 1].content.length
    if (length > MAX_HISTORY_LENGTH && start < turns.length) break
    start -= 1
  }
  return turns.slice(start)
}
