import type { Question } from '@common/types/question'

import { fromMarkdown } from 'mdast-util-from-markdown'

import type { GroupedAnswer } from '../QuestionResults/getAnswersByQuestionId'

import { getLanguageValue } from '../../../../../util/languageUtils'
import getAnswersByQuestionId from '../QuestionResults/getAnswersByQuestionId'

export type TextQuestion = Extract<Question, { type: 'TEXT' }>

export type ResultQuestion = Exclude<Question, { type: 'TEXT' }> & { feedbacks: GroupedAnswer[] }

export type ResultBlock =
  | { type: 'TEXT'; key: string; question: TextQuestion; headingLevel: number }
  | { type: 'LIKERT'; key: string; questions: ResultQuestion[]; headingLevel: number }
  | { type: 'CHOICE' | 'OPEN'; key: string; question: ResultQuestion; headingLevel: number }

type Options = {
  questions: Question[] | undefined
  questionOrder?: number[]
  feedbacks: Parameters<typeof getAnswersByQuestionId>[0]
  isVisible: (question: Question) => boolean
  language: string
  baseHeadingLevel: number
}

const MAX_HEADING_LEVEL = 6

type MarkdownNode = ReturnType<typeof fromMarkdown> | ReturnType<typeof fromMarkdown>['children'][number]

// Parsed as react-markdown parses it, so that the headings found are the ones TextSection renders
const getLastHeadingDepth = (markdown: string) => {
  let depth: number | undefined
  const visit = (node: MarkdownNode) => {
    if (node.type === 'heading') depth = node.depth
    else if ('children' in node) node.children.forEach(visit)
  }
  visit(fromMarkdown(markdown))
  return depth
}

// A markdown heading of the given depth, in a text section whose top-level headings are at baseLevel
export const getHeadingLevel = (baseLevel: number, depth: number) => Math.min(MAX_HEADING_LEVEL, baseLevel + depth - 1)

export const buildBlocks = ({
  questions,
  questionOrder,
  feedbacks,
  isVisible,
  language,
  baseHeadingLevel,
}: Options): ResultBlock[] => {
  const answersByQuestionId = getAnswersByQuestionId(feedbacks)
  const ordered = questionOrder
    ? questionOrder.map(id => questions?.find(q => q.id === id)).filter(q => q !== undefined)
    : (questions ?? [])

  const blocks: ResultBlock[] = []
  let headingDepth = 0

  for (const question of ordered) {
    if (question.type === 'TEXT') {
      blocks.push({ type: 'TEXT', key: `text-${question.id}`, question, headingLevel: baseHeadingLevel })
      headingDepth = getLastHeadingDepth(getLanguageValue(question.data.content, language) ?? '') ?? headingDepth
    } else if (isVisible(question)) {
      const withFeedbacks = { ...question, feedbacks: answersByQuestionId[question.id] ?? [] }
      const previous = blocks.at(-1)

      if (question.type !== 'LIKERT') {
        blocks.push({
          type: question.type === 'OPEN' ? 'OPEN' : 'CHOICE',
          key: `question-${question.id}`,
          question: withFeedbacks,
          headingLevel: getHeadingLevel(baseHeadingLevel, headingDepth + 1),
        })
      } else if (previous?.type === 'LIKERT') {
        previous.questions.push(withFeedbacks)
      } else {
        blocks.push({
          type: 'LIKERT',
          key: `likert-${question.id}`,
          questions: [withFeedbacks],
          headingLevel: getHeadingLevel(baseHeadingLevel, headingDepth + 1),
        })
      }
    }
  }

  return blocks
}
