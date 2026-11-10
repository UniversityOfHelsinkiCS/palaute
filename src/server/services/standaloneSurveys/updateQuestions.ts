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
  // Only used for new questions, existing ones change it with updatePublicQuestions
  visibility?: StandaloneQuestionVisibility
}

const isGrouping = (question: QuestionInput) => question.secondaryType === 'GROUPING'

const assertCanPublish = (survey: StandaloneSurvey, questionTypes: QuestionType[]) => {
  if (questionTypes.includes('OPEN') && !survey.isEnded()) {
    throw ApplicationError.Forbidden('Open answers can be published only after the survey has closed')
  }
}

export const updateQuestions = async (survey: StandaloneSurvey, inputs: QuestionInput[], user: User) => {
  if (survey.opensAt <= new Date() && !user.isAdmin) {
    throw ApplicationError.Forbidden('Questions cannot be changed once the survey has opened')
  }

  validateGroupingQuestions(inputs)
  const questions = _.sortBy(inputs, q => (isGrouping(q) ? 0 : 1))
  assertCanPublish(
    survey,
    questions.filter(q => !q.id && q.visibility === 'PUBLIC').map(q => q.type)
  )

  const existing = survey.surveyQuestions ?? []
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
          { position },
          { where: { standaloneSurveyId: survey.id, questionId: input.id }, transaction }
        )
      } else {
        const question = await Question.create(values, { transaction })
        created.push(question.id)
        await StandaloneSurveyQuestion.create(
          {
            standaloneSurveyId: survey.id,
            questionId: question.id,
            position,
            visibility: input.visibility ?? 'PRIVATE',
          },
          { transaction }
        )
      }
    }
  })

  const questionsById = _.keyBy(existing, 'questionId')
  const logData: Record<string, unknown> = {}
  if (created.length > 0) {
    const first = questions.find(q => !q.id)
    logData.createQuestion = { ...first?.data, id: created[0] }
  }
  if (removedIds.length > 0) {
    logData.deleteQuestion = { ...questionsById[removedIds[0]]?.question?.data, id: removedIds[0] }
  }

  await createLog(survey.id, user, logData)
}

export const updatePublicQuestions = async (survey: StandaloneSurvey, publicQuestionIds: number[], user: User) => {
  const surveyQuestions = survey.surveyQuestions ?? []
  const questionsById = _.keyBy(surveyQuestions, 'questionId')

  if (publicQuestionIds.some(id => !questionsById[id])) {
    throw ApplicationError.BadRequest('Question does not belong to this survey')
  }

  const wasPublic = surveyQuestions.filter(sq => sq.visibility === 'PUBLIC').map(sq => sq.questionId)
  const enabled = _.difference(publicQuestionIds, wasPublic)
  const disabled = _.difference(wasPublic, publicQuestionIds)

  assertCanPublish(
    survey,
    enabled.map(id => questionsById[id].question!.type)
  )

  await sequelize.transaction(async transaction => {
    const setVisibility = (questionIds: number[], visibility: StandaloneQuestionVisibility) =>
      StandaloneSurveyQuestion.update(
        { visibility },
        { where: { standaloneSurveyId: survey.id, questionId: questionIds }, transaction }
      )
    if (enabled.length > 0) await setVisibility(enabled, 'PUBLIC')
    if (disabled.length > 0) await setVisibility(disabled, 'PRIVATE')
  })

  const toLogQuestion = (id: number) => ({ id, data: questionsById[id].question?.data })
  const logData: Record<string, unknown> = {}
  if (enabled.length > 0) logData.enabledPublicQuestions = enabled.map(toLogQuestion)
  if (disabled.length > 0) logData.disabledPublicQuestions = disabled.map(toLogQuestion)

  await createLog(survey.id, user, logData)
}
