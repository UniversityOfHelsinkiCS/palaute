import type { QuestionType } from '@common/types/question'

import _ from 'lodash'

import type { StandaloneQuestionVisibility } from '../../models/standaloneSurveyQuestion'

import { sequelize } from '../../db/dbConnection'
import { StandaloneSurvey, StandaloneSurveyQuestion, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { assertQuestionsVersion, logAfterSave, QuestionInput, saveQuestionList } from '../questions/saveQuestions'
import { getAccess } from './access'
import { createLog } from './logs'

const assertCanPublish = (survey: StandaloneSurvey, questionTypes: QuestionType[]) => {
  if (questionTypes.includes('OPEN') && !survey.isEnded()) {
    throw ApplicationError.Forbidden('Open answers can be published only after the survey has closed')
  }
}

// `public` only sets a new question's visibility, existing ones change it with setQuestionPublicity
export const updateQuestions = async (
  survey: StandaloneSurvey,
  questions: QuestionInput[],
  questionsVersion: number,
  user: User
) => {
  if (!getAccess(survey, user).canEditQuestions) {
    throw ApplicationError.Forbidden('Questions cannot be changed once the survey has opened')
  }

  const newQuestions = questions.filter(q => q.clientId)
  assertCanPublish(
    survey,
    newQuestions.flatMap(q => (q.public && q.type ? [q.type] : []))
  )

  const result = await sequelize.transaction(async transaction => {
    const locked = await StandaloneSurvey.findByPk(survey.id, { lock: transaction.LOCK.UPDATE, transaction })
    if (!locked) throw ApplicationError.NotFound('Survey not found')
    assertQuestionsVersion(locked, questionsVersion)

    const existing = await StandaloneSurveyQuestion.findAll({
      where: { standaloneSurveyId: survey.id },
      order: [['position', 'ASC']],
      transaction,
    })

    const saved = await saveQuestionList({
      currentIds: existing.map(sq => sq.questionId),
      questions,
      transaction,
    })

    if (saved.removedIds.length > 0) {
      await StandaloneSurveyQuestion.destroy({
        where: { standaloneSurveyId: survey.id, questionId: saved.removedIds },
        transaction,
      })
    }

    for (const [position, questionId] of saved.questionIds.entries()) {
      const input = newQuestions.find(q => saved.createdIds[q.clientId!] === questionId)
      if (input) {
        const visibility: StandaloneQuestionVisibility =
          input.public && input.secondaryType !== 'GROUPING' ? 'PUBLIC' : 'PRIVATE'
        await StandaloneSurveyQuestion.create(
          { standaloneSurveyId: survey.id, questionId, position, visibility },
          { transaction }
        )
      } else {
        await StandaloneSurveyQuestion.update(
          { position },
          { where: { standaloneSurveyId: survey.id, questionId }, transaction }
        )
      }
    }

    locked.questionsVersion += 1
    await locked.save({ transaction })

    return saved
  })

  const previousById = _.keyBy(survey.surveyQuestions ?? [], 'questionId')
  const logData: Record<string, unknown> = {}
  const [firstCreatedId] = result.newIds
  if (firstCreatedId) {
    const created = result.questions.find(q => q.id === firstCreatedId)
    logData.createQuestion = { ...created?.data, id: firstCreatedId }
  }
  const [firstRemovedId] = result.removedIds
  if (firstRemovedId) {
    logData.deleteQuestion = { ...previousById[firstRemovedId]?.question?.data, id: firstRemovedId }
  }

  await logAfterSave(() => createLog(survey.id, user, logData))

  return { createdIds: result.createdIds }
}

export const setQuestionPublicity = async (
  survey: StandaloneSurvey,
  questionId: number,
  isPublic: boolean,
  user: User
) => {
  const surveyQuestion = survey.surveyQuestions?.find(sq => sq.questionId === questionId)
  const question = surveyQuestion?.question
  if (!surveyQuestion || !question) throw ApplicationError.BadRequest('Question does not belong to this survey')
  if (question.secondaryType === 'GROUPING') {
    throw ApplicationError.Forbidden('Publicity of this question cannot be changed')
  }
  if (isPublic) assertCanPublish(survey, [question.type])

  const visibility: StandaloneQuestionVisibility = isPublic ? 'PUBLIC' : 'PRIVATE'
  if (surveyQuestion.visibility === visibility) return

  await StandaloneSurveyQuestion.update({ visibility }, { where: { id: surveyQuestion.id } })
  await logAfterSave(() =>
    createLog(survey.id, user, {
      [isPublic ? 'enabledPublicQuestions' : 'disabledPublicQuestions']: [{ id: questionId, data: question.data }],
    })
  )
}
