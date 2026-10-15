import type { HelpChatbotTurnStatus } from '@common/types/helpChatbot'

type ChainTurn = { id: string; previousTurnId: string | null; status: HelpChatbotTurnStatus; question: string | null }

export type TurnAnnotations = {
  number: number
  followsNumber: number | null
  inHistory: boolean
  retriedAsNumber: number | null
}

// Numbers the turns (given in the order asked) and marks the chain of answers leading to the latest one, which is
// what the user saw. An unanswered question asked again after the same turn gets the retry's number.
export const annotateTurns = <T extends ChainTurn>(turns: T[]): (T & TurnAnnotations)[] => {
  const numbers = new Map(turns.map((turn, i) => [turn.id, i + 1]))
  const byId = new Map(turns.map(turn => [turn.id, turn]))

  const inHistory = new Set<string>()
  const latestAnswered = [...turns].reverse().find(turn => turn.status === 'answered')
  let id = latestAnswered?.id ?? null
  while (id !== null && byId.has(id) && !inHistory.has(id)) {
    inHistory.add(id)
    id = byId.get(id).previousTurnId
  }

  return turns.map((turn, i) => {
    const retry =
      turn.status === 'answered'
        ? undefined
        : turns
            .slice(i + 1)
            .find(later => later.previousTurnId === turn.previousTurnId && later.question === turn.question)
    return {
      ...turn,
      number: i + 1,
      followsNumber: turn.previousTurnId === null ? null : (numbers.get(turn.previousTurnId) ?? null),
      inHistory: inHistory.has(turn.id),
      retriedAsNumber: retry ? numbers.get(retry.id) : null,
    }
  })
}
