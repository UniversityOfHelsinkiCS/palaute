import { describe, expect, it } from 'vitest'

import { removeOpenAnswers, setOpenAnswersHidden } from './openAnswers'

const data = [
  { questionId: 1, data: 'hello' },
  { questionId: 1, data: 'other' },
  { questionId: 2, data: 'hello', hidden: true },
]

describe('setOpenAnswersHidden', () => {
  it('hides matching answers of the question only', () => {
    const result = setOpenAnswersHidden(data, 1, 'hello', true)
    expect(result.matchedCount).toBe(1)
    expect(result.changedCount).toBe(1)
    expect(result.data).toEqual([
      { questionId: 1, data: 'hello', hidden: true },
      { questionId: 1, data: 'other' },
      { questionId: 2, data: 'hello', hidden: true },
    ])
  })

  it('counts a match without a change when already in that state', () => {
    const result = setOpenAnswersHidden(data, 2, 'hello', true)
    expect(result.matchedCount).toBe(1)
    expect(result.changedCount).toBe(0)
  })
})

describe('removeOpenAnswers', () => {
  it('removes matching answers of the question only', () => {
    const result = removeOpenAnswers(data, 2, 'hello')
    expect(result.removed).toBe(true)
    expect(result.data).toEqual(data.slice(0, 2))
  })

  it('reports no removal when nothing matches', () => {
    expect(removeOpenAnswers(data, 3, 'hello').removed).toBe(false)
  })
})
