import { describe, expect, it } from 'vitest'

import { assertOwnQuestionIds } from './surveyQuestions'

describe('assertOwnQuestionIds', () => {
  it('accepts own and new questions', () => {
    expect(() => assertOwnQuestionIds([{ id: 1 }, {}, { id: 2 }, { id: null }], [1, 2, 3])).not.toThrow()
  })

  it('rejects a question of another survey', () => {
    expect(() => assertOwnQuestionIds([{ id: 1 }, { id: 99 }], [1, 2])).toThrow('does not belong')
  })

  it('rejects a duplicate question', () => {
    expect(() => assertOwnQuestionIds([{ id: 1 }, { id: 1 }], [1, 2])).toThrow('Duplicate')
  })
})
