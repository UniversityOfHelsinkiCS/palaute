export type ChatMessage = { role: 'user' | 'assistant'; content: string }

// Characters of conversation sent to the model. Bounds the prompt, and so the cost, of a long conversation.
export const MAX_HISTORY_LENGTH = 30_000

// The newest messages whose content fits in MAX_HISTORY_LENGTH. The latest message is always kept,
// so a long conversation never fails. An answer whose question didn't fit is dropped too, so the history
// starts with a question.
export const trimHistory = (messages: ChatMessage[]): ChatMessage[] => {
  let length = 0
  let start = messages.length
  while (start > 0) {
    length += messages[start - 1].content.length
    if (length > MAX_HISTORY_LENGTH && start < messages.length) break
    start -= 1
  }
  while (start < messages.length - 1 && messages[start].role === 'assistant') start += 1
  return messages.slice(start)
}

export type AnsweredTurn = { id: string; previousTurnId: string | null; question: string; answer: string }

// The conversation that leads up to previousTurnId, oldest first: follows previousTurnId through `turns`, a
// conversation's answered turns. Turns that aren't on the way, such as an answer the user never saw, are left out.
// Returns null if previousTurnId isn't one of `turns`.
export const buildHistory = (turns: AnsweredTurn[], previousTurnId: string | null): ChatMessage[] | null => {
  if (previousTurnId === null) return []
  const byId = new Map(turns.map(turn => [turn.id, turn]))
  if (!byId.has(previousTurnId)) return null

  const chain: AnsweredTurn[] = []
  let id: string | null = previousTurnId
  // A turn always points to an older one, so this ends; the length check is a safeguard against a cycle
  while (id !== null && byId.has(id) && chain.length < turns.length) {
    const turn = byId.get(id)
    chain.push(turn)
    id = turn.previousTurnId
  }

  return chain.reverse().flatMap(({ question, answer }): ChatMessage[] => [
    { role: 'user', content: question },
    { role: 'assistant', content: answer },
  ])
}
