import { describe, expect, it } from 'vitest'

import { annotateTurns } from './annotateTurns'

type Status = 'pending' | 'answered' | 'empty' | 'failed' | 'aborted'

const turn = (id: string, previousTurnId: string | null, status: Status = 'answered', question = `Question ${id}`) => ({
  id,
  previousTurnId,
  status,
  question,
})

const annotations = (turns: ReturnType<typeof turn>[]) =>
  annotateTurns(turns).map(({ number, followsNumber, inHistory, retriedAsNumber }) => ({
    number,
    followsNumber,
    inHistory,
    retriedAsNumber,
  }))

describe('annotateTurns', () => {
  it('numbers the turns and marks a plain conversation as the history', () => {
    expect(annotations([turn('a', null), turn('b', 'a')])).toEqual([
      { number: 1, followsNumber: null, inHistory: true, retriedAsNumber: null },
      { number: 2, followsNumber: 1, inHistory: true, retriedAsNumber: null },
    ])
  })

  it('marks a failed question as retried by the turn that asked it again', () => {
    const turns = [turn('a', null), turn('b', 'a', 'failed', 'Again?'), turn('c', 'a', 'answered', 'Again?')]
    expect(annotations(turns)).toEqual([
      { number: 1, followsNumber: null, inHistory: true, retriedAsNumber: null },
      { number: 2, followsNumber: 1, inHistory: false, retriedAsNumber: 3 },
      { number: 3, followsNumber: 1, inHistory: true, retriedAsNumber: null },
    ])
  })

  it("leaves out an answer the next question didn't follow", () => {
    // The answer to b was lost on the way, so the user asked c after a
    const turns = [turn('a', null), turn('b', 'a'), turn('c', 'a')]
    expect(annotations(turns).map(({ inHistory }) => inHistory)).toEqual([true, false, true])
  })

  it('leaves out a last question that got no answer, without a retry', () => {
    const turns = [turn('a', null), turn('b', 'a', 'empty')]
    expect(annotations(turns)).toEqual([
      { number: 1, followsNumber: null, inHistory: true, retriedAsNumber: null },
      { number: 2, followsNumber: 1, inHistory: false, retriedAsNumber: null },
    ])
  })

  it('does not count a different question as a retry', () => {
    const turns = [turn('a', null, 'failed', 'One'), turn('b', null, 'answered', 'Two')]
    expect(annotations(turns)[0].retriedAsNumber).toBeNull()
  })

  it('has no history when nothing was answered', () => {
    expect(annotations([turn('a', null, 'failed'), turn('b', null, 'aborted', 'Other')])).toEqual([
      { number: 1, followsNumber: null, inHistory: false, retriedAsNumber: null },
      { number: 2, followsNumber: null, inHistory: false, retriedAsNumber: null },
    ])
  })

  it('handles a turn that follows one outside the conversation', () => {
    expect(annotations([turn('b', 'gone')])[0]).toMatchObject({ followsNumber: null, inHistory: true })
  })
})
