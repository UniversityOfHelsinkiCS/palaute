import type { QuestionData, QuestionSecondaryType, QuestionType } from '@common/types/question'

import { Question } from '../../models'
import { validateGroupingQuestions } from '../../util/groupingQuestion'
import { assertOwnQuestionIds } from '../../util/surveyQuestions'

type QuestionInput = {
  id?: number | null
  type: QuestionType
  secondaryType?: QuestionSecondaryType
  required?: boolean
  data: QuestionData
}

export const saveQuestions = async (questions: QuestionInput[], surveyQuestionIds: number[]) => {
  assertOwnQuestionIds(questions, surveyQuestionIds)
  validateGroupingQuestions(questions)

  const ids: number[] = []
  for (const { id, type, secondaryType, required, data } of questions) {
    const values = { type, secondaryType: secondaryType ?? null, required: required ?? false, data }
    if (id) {
      await Question.update(values, { where: { id } })
      ids.push(id)
    } else {
      const question = await Question.create(values)
      ids.push(question.id)
    }
  }

  return ids
}
