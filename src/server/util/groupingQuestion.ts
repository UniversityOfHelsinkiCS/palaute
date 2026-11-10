import type { QuestionAnswer } from '@common/types/question'

import _ from 'lodash'

import { ApplicationError } from './ApplicationError'

export const validateGroupingQuestions = (questions: { type: string; secondaryType?: string | null }[]) => {
  const tooManyGroupingQuestions = _.countBy(questions, 'secondaryType').GROUPING > 1
  if (tooManyGroupingQuestions) throw ApplicationError.BadRequest('Maximum of one grouping question is allowed')

  const illegalGroupingQuestion = questions.some(
    q => q.secondaryType === 'GROUPING' && !['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type)
  )
  if (illegalGroupingQuestion)
    throw ApplicationError.BadRequest('Only single choice and multiple choice may be grouping questions')
}

export const getGroupingAnswers = (data: QuestionAnswer[] | undefined, groupingQuestionId: number): string[] =>
  [data?.find(answer => answer.questionId === groupingQuestionId)?.data ?? []].flat()
