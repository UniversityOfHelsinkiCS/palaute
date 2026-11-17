import type { Question } from '@common/types/question'

import { describe, expect, it } from 'vitest'

import type { ResultQuestion } from './blocks'

import { buildBlocks } from './blocks'
import { formatPercent, getLikertCounts, getOptionCounts } from './counts'

const text = (id: number, content: string): Question => ({
  id,
  type: 'TEXT',
  secondaryType: null,
  required: false,
  data: { content: { fi: content } },
})

const question = (id: number, type: 'LIKERT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'OPEN'): Question => ({
  id,
  type,
  secondaryType: null,
  required: false,
  data: {
    label: { fi: `Q${id}` },
    options: [
      { id: 'opt-a', label: { fi: 'A' } },
      { id: 'opt-b', label: { fi: 'B' } },
    ],
  },
})

const build = (questions: Question[], options: Partial<Parameters<typeof buildBlocks>[0]> = {}) =>
  buildBlocks({ questions, feedbacks: [], isVisible: () => true, language: 'fi', baseHeadingLevel: 2, ...options })

const shape = (blocks: ReturnType<typeof buildBlocks>) =>
  blocks.map(block => (block.type === 'LIKERT' ? block.questions.map(q => q.id) : `${block.type}:${block.question.id}`))

describe('buildBlocks', () => {
  it('keeps survey order and merges consecutive Likert questions', () => {
    const blocks = build([
      question(1, 'SINGLE_CHOICE'),
      text(2, '## Part 1'),
      question(3, 'LIKERT'),
      question(4, 'LIKERT'),
      question(5, 'OPEN'),
      question(6, 'LIKERT'),
      text(7, 'Rate these'),
      question(8, 'LIKERT'),
      question(9, 'MULTIPLE_CHOICE'),
    ])

    expect(shape(blocks)).toEqual(['CHOICE:1', 'TEXT:2', [3, 4], 'OPEN:5', [6], 'TEXT:7', [8], 'CHOICE:9'])
  })

  it('follows questionOrder when given', () => {
    const blocks = build([question(1, 'OPEN'), text(2, 'Intro'), question(3, 'LIKERT')], {
      questionOrder: [3, 2, 1, 99],
    })

    expect(shape(blocks)).toEqual([[3], 'TEXT:2', 'OPEN:1'])
  })

  it('leaves out hidden questions without splitting a Likert group, and keeps text sections', () => {
    const blocks = build(
      [text(1, 'Intro'), question(2, 'LIKERT'), question(3, 'LIKERT'), question(4, 'LIKERT'), question(5, 'OPEN')],
      {
        isVisible: q => q.id !== 3 && q.id !== 5,
      }
    )

    expect(shape(blocks)).toEqual(['TEXT:1', [2, 4]])
  })

  it('attaches non-blank answers to their questions', () => {
    const feedbacks = [
      {
        data: [
          { questionId: 1, data: '4' },
          { questionId: 2, data: 'Good course' },
        ],
      },
      {
        data: [
          { questionId: 1, data: '' },
          { questionId: 2, data: ' ' },
        ],
      },
    ]
    const [likert, open] = build([question(1, 'LIKERT'), question(2, 'OPEN')], { feedbacks })

    expect(likert.type === 'LIKERT' && likert.questions[0].feedbacks.map(f => f.data)).toEqual(['4'])
    expect(open.type === 'OPEN' && open.question.feedbacks.map(f => f.data)).toEqual(['Good course'])
  })

  it('puts question headings one level below the latest text heading', () => {
    const blocks = build([
      question(1, 'OPEN'),
      text(2, '# Welcome\n\nBody\n\n## Part 1'),
      question(3, 'OPEN'),
      text(4, 'No heading here'),
      question(5, 'SINGLE_CHOICE'),
      text(6, '###### Deep'),
      question(7, 'OPEN'),
    ])

    expect(blocks.map(block => ('headingLevel' in block ? block.headingLevel : null))).toEqual([2, 2, 4, 2, 4, 2, 6])
  })
})

describe('counts', () => {
  const withAnswers = (q: Question, answers: (string | string[])[]): ResultQuestion => {
    const [block] = build([q], { feedbacks: answers.map(data => ({ data: [{ questionId: q.id, data }] })) })
    if (block.type === 'TEXT') throw new Error('Not an answerable question')
    return block.type === 'LIKERT' ? block.questions[0] : block.question
  }

  it('counts options of single and multiple choice questions', () => {
    const single = withAnswers(question(1, 'SINGLE_CHOICE'), ['opt-a', 'opt-a', 'opt-b'])
    const multiple = withAnswers(question(2, 'MULTIPLE_CHOICE'), [['opt-a', 'opt-b'], ['opt-b']])

    expect(getOptionCounts(single, 'fi').map(o => [o.label, o.count])).toEqual([
      ['A', 2],
      ['B', 1],
    ])
    expect(getOptionCounts(multiple, 'fi').map(o => o.count)).toEqual([1, 2])
  })

  it('counts Likert answers by value with "don\'t know" first', () => {
    const likert = withAnswers(question(1, 'LIKERT'), ['5', '5', '1', '0'])

    expect(getLikertCounts(likert)).toEqual([1, 1, 0, 0, 0, 2])
  })

  it('formats a share as a percentage', () => {
    expect(formatPercent(62, 143)).toBe('43 %')
    expect(formatPercent(0, 0)).toBe('0 %')
  })
})
