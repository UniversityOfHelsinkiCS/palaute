import type { QuestionAnswer } from '@common/types/question'

import { groupBy } from 'lodash-es'

type Feedback = { id?: number; data?: QuestionAnswer[] }

export type GroupedAnswer = QuestionAnswer & { feedbackId?: number }

const hasContent = ({ data }: QuestionAnswer) => {
  if (Array.isArray(data)) return data.length > 0
  return !Number.isNaN(parseInt(data, 10)) || (typeof data === 'string' && data.trim().length > 1)
}

// Blank answers and open answers of one character are left out
const getAnswersByQuestionId = (feedbacks: Feedback[] | undefined): Record<string, GroupedAnswer[]> => {
  const answers = (feedbacks ?? [])
    .flatMap(feedback =>
      Array.isArray(feedback.data) ? feedback.data.map(answer => ({ ...answer, feedbackId: feedback.id })) : []
    )
    .filter(hasContent)

  return groupBy(answers, ({ questionId }) => questionId ?? '_')
}

export default getAnswersByQuestionId
