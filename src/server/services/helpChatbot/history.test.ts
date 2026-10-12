import { describe, expect, it } from 'vitest'

import { buildHistory, MAX_HISTORY_LENGTH, trimHistory } from './history'

const user = (content: string) => ({ role: 'user' as const, content })
const assistant = (content: string) => ({ role: 'assistant' as const, content })

const turn = (id: string, previousTurnId: string | null) => ({
  id,
  previousTurnId,
  question: `Question ${id}`,
  answer: `Answer ${id}`,
})

const exchange = (id: string) => [user(`Question ${id}`), assistant(`Answer ${id}`)]

describe('buildHistory', () => {
  it('is empty for the first question', () => {
    expect(buildHistory([turn('a', null)], null)).toEqual([])
  })

  it('follows the conversation back from the previous turn, oldest first', () => {
    const turns = [turn('a', null), turn('b', 'a'), turn('c', 'b')]
    expect(buildHistory(turns, 'c')).toEqual([...exchange('a'), ...exchange('b'), ...exchange('c')])
  })

  it('leaves out answers the user never saw', () => {
    // b was answered, but the client never got it and asked again after a, which gave c
    const turns = [turn('a', null), turn('b', 'a'), turn('c', 'a')]
    expect(buildHistory(turns, 'c')).toEqual([...exchange('a'), ...exchange('c')])
  })

  it('starts at the previous turn, ignoring later ones', () => {
    const turns = [turn('a', null), turn('b', 'a'), turn('c', 'b')]
    expect(buildHistory(turns, 'b')).toEqual([...exchange('a'), ...exchange('b')])
  })

  it('stops where a turn points to one that is not answered', () => {
    expect(buildHistory([turn('b', 'failed')], 'b')).toEqual(exchange('b'))
  })

  it('returns null for an unknown previous turn', () => {
    expect(buildHistory([turn('a', null)], 'someone-elses')).toBeNull()
    expect(buildHistory([], 'a')).toBeNull()
  })

  it('ends on a cycle', () => {
    const turns = [turn('a', 'b'), turn('b', 'a')]
    expect(buildHistory(turns, 'b')).toEqual([...exchange('a'), ...exchange('b')])
  })
})

describe('trimHistory', () => {
  it('keeps a history that fits in the budget', () => {
    const messages = [user('a'), assistant('b'), user('c')]
    expect(trimHistory(messages)).toEqual(messages)
  })

  it('drops the oldest messages first', () => {
    const messages = [user('old'), assistant('x'.repeat(MAX_HISTORY_LENGTH)), user('new')]
    expect(trimHistory(messages)).toEqual([user('new')])
  })

  it('keeps messages that exactly fill the budget', () => {
    const messages = [user('x'.repeat(MAX_HISTORY_LENGTH - 2)), assistant('y'), user('z')]
    expect(trimHistory(messages)).toEqual(messages)
  })

  it('drops an answer whose question was trimmed', () => {
    const messages = [user('x'.repeat(MAX_HISTORY_LENGTH)), assistant('Answer'), user('Next')]
    expect(trimHistory(messages)).toEqual([user('Next')])
  })

  it('keeps a question and its answer that fit after an older exchange is trimmed', () => {
    const messages = [user('x'.repeat(MAX_HISTORY_LENGTH)), assistant('a'), user('b'), assistant('c'), user('d')]
    expect(trimHistory(messages)).toEqual([user('b'), assistant('c'), user('d')])
  })

  it('always keeps the latest message', () => {
    const latest = user('x'.repeat(MAX_HISTORY_LENGTH + 1))
    expect(trimHistory([user('older'), latest])).toEqual([latest])
  })

  it('returns an empty history as is', () => {
    expect(trimHistory([])).toEqual([])
  })
})
