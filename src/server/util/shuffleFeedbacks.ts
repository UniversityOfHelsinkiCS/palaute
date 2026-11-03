import type { QuestionAnswer } from '@common/types/question'

import _ from 'lodash'

type WithAnswers = { data: QuestionAnswer[] }

/**
 * Shuffle feedbacks so that answers from the same student are not identifiable.
 */
export const shuffleFeedbacks = <T extends WithAnswers>(feedbacks: T[], questionIds: number[]): T[] => {
  const shuffledAnswers = _.shuffle(feedbacks.flatMap(({ data }) => data))
  const answersByQuestion = _.groupBy(shuffledAnswers, 'questionId')

  const shuffledFeedbacks = Array.from(feedbacks, feedback => feedback).map((feedback, i) => ({
    ...feedback,
    data: questionIds.map(questionId => answersByQuestion?.[questionId]?.[i] ?? { questionId, data: '' }),
  }))

  return shuffledFeedbacks
}

export const getPublicFeedbacks = <T extends WithAnswers>(allFeedbacks: T[], publicQuestionIds: number[]): T[] =>
  allFeedbacks.map(feedback => ({
    ...feedback,
    data: feedback.data.filter(answer => !answer.hidden && publicQuestionIds.includes(answer.questionId)),
  }))
