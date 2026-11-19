import type { Question } from '@common/types/question'

import type { GroupedAnswer } from '../QuestionResults/getAnswersByQuestionId'

import getAnswersByQuestionId from '../QuestionResults/getAnswersByQuestionId'

export type TextQuestion = Extract<Question, { type: 'TEXT' }>

export type ResultQuestion = Exclude<Question, { type: 'TEXT' }> & { feedbacks: GroupedAnswer[] }

export type ResultBlock =
  | { type: 'TEXT'; key: string; question: TextQuestion }
  | { type: 'LIKERT'; key: string; questions: ResultQuestion[] }
  | { type: 'CHOICE' | 'OPEN'; key: string; question: ResultQuestion }

type Options = {
  questions: Question[] | undefined
  questionOrder?: number[]
  feedbacks: Parameters<typeof getAnswersByQuestionId>[0]
  isVisible: (question: Question) => boolean
}

export const buildBlocks = ({ questions, questionOrder, feedbacks, isVisible }: Options): ResultBlock[] => {
  const answersByQuestionId = getAnswersByQuestionId(feedbacks)
  const ordered = questionOrder
    ? questionOrder.map(id => questions?.find(q => q.id === id)).filter(q => q !== undefined)
    : (questions ?? [])

  const blocks: ResultBlock[] = []

  for (const question of ordered) {
    if (question.type === 'TEXT') {
      blocks.push({ type: 'TEXT', key: `text-${question.id}`, question })
    } else if (isVisible(question)) {
      const withFeedbacks = { ...question, feedbacks: answersByQuestionId[question.id] ?? [] }
      const previous = blocks.at(-1)

      if (question.type !== 'LIKERT') {
        blocks.push({
          type: question.type === 'OPEN' ? 'OPEN' : 'CHOICE',
          key: `question-${question.id}`,
          question: withFeedbacks,
        })
      } else if (previous?.type === 'LIKERT') {
        previous.questions.push(withFeedbacks)
      } else {
        blocks.push({ type: 'LIKERT', key: `likert-${question.id}`, questions: [withFeedbacks] })
      }
    }
  }

  return blocks
}
