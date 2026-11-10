import type { QuestionData, QuestionSecondaryType, QuestionType } from '@common/types/question'

import _ from 'lodash'

import type { StandaloneQuestionVisibility } from '../../models/standaloneSurveyQuestion'

import { sequelize } from '../../db/dbConnection'
import { Question, StandaloneSurvey, StandaloneSurveyQuestion, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { validateGroupingQuestions } from '../../util/groupingQuestion'
import { createLog } from './logs'

export type QuestionInput = {
  id?: number
  type: QuestionType
  secondaryType?: QuestionSecondaryType
  required: boolean
  data: QuestionData
  visibility: StandaloneQuestionVisibility
}

const isGrouping = (question: QuestionInput) => question.secondaryType === 'GROUPING'

const changesContent = (questions: QuestionInput[], existing: StandaloneSurveyQuestion[]) =>
  questions.length !== existing.length ||
  questions.some((input, index) => {
    const { questionId, question } = existing[index]
    return (
      input.id !== questionId ||
      input.type !== question?.type ||
      isGrouping(input) !== (question?.secondaryType === 'GROUPING') ||
      input.required !== question?.required ||
      !_.isEqual(input.data, question?.data)
    )
  })

export const updateQuestions = async (survey: StandaloneSurvey, inputs: QuestionInput[], user: User) => {
  const existing = survey.surveyQuestions ?? []

  validateGroupingQuestions(inputs)
  const questions = _.sortBy(inputs, q => (isGrouping(q) ? 0 : 1))

  if (survey.opensAt <= new Date() && !user.isAdmin && changesContent(questions, existing)) {
    throw ApplicationError.Forbidden('Only the visibility of questions can be changed once the survey has opened')
  }

  const publishesOpenAnswers = questions.some(
    q =>
      q.type === 'OPEN' &&
      q.visibility === 'PUBLIC' &&
      existing.find(sq => sq.questionId === q.id)?.visibility !== 'PUBLIC'
  )
  if (publishesOpenAnswers && !survey.isEnded()) {
    throw ApplicationError.Forbidden('Open answers can be published only after the survey has closed')
  }

  const existingIds = existing.map(sq => sq.questionId)
  const inputIds = questions.flatMap(q => (q.id ? [q.id] : []))

  if (inputIds.some(id => !existingIds.includes(id))) {
    throw ApplicationError.BadRequest('Question does not belong to this survey')
  }
  if (_.uniq(inputIds).length !== inputIds.length) throw ApplicationError.BadRequest('Duplicate question')

  const removedIds = _.difference(existingIds, inputIds)

  const created: number[] = []
  await sequelize.transaction(async transaction => {
    if (removedIds.length > 0) {
      await StandaloneSurveyQuestion.destroy({
        where: { standaloneSurveyId: survey.id, questionId: removedIds },
        transaction,
      })
    }

    for (const [position, input] of questions.entries()) {
      const values = {
        type: input.type,
        secondaryType: input.secondaryType ?? null,
        required: input.required,
        data: input.data,
      }

      if (input.id) {
        await Question.update(values, { where: { id: input.id }, transaction })
        await StandaloneSurveyQuestion.update(
          { position, visibility: input.visibility },
          { where: { standaloneSurveyId: survey.id, questionId: input.id }, transaction }
        )
      } else {
        const question = await Question.create(values, { transaction })
        created.push(question.id)
        await StandaloneSurveyQuestion.create(
          { standaloneSurveyId: survey.id, questionId: question.id, position, visibility: input.visibility },
          { transaction }
        )
      }
    }
  })

  const wasPublic = existing.filter(sq => sq.visibility === 'PUBLIC').map(sq => sq.questionId)
  const isPublic = questions.filter(q => q.id && q.visibility === 'PUBLIC').map(q => q.id!)
  const questionsById = _.keyBy(existing, 'questionId')
  const toLogQuestion = (id: number) => ({ id, data: questionsById[id]?.question?.data })

  const logData: Record<string, unknown> = {}
  if (created.length > 0) {
    const first = questions.find(q => !q.id)
    logData.createQuestion = { ...first?.data, id: created[0] }
  }
  if (removedIds.length > 0) {
    logData.deleteQuestion = { ...questionsById[removedIds[0]]?.question?.data, id: removedIds[0] }
  }
  const enabled = _.difference(isPublic, wasPublic)
  const disabled = _.difference(_.intersection(wasPublic, inputIds), isPublic)
  if (enabled.length > 0) logData.enabledPublicQuestions = enabled.map(toLogQuestion)
  if (disabled.length > 0) logData.disabledPublicQuestions = disabled.map(toLogQuestion)

  await createLog(survey.id, user, logData)
}
