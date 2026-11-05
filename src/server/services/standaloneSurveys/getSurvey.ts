import type { Question as QuestionJson } from '@common/types/question'

import {
  Question,
  StandaloneSurvey,
  StandaloneSurveyQuestion,
  StandaloneSurveyResponsibleUser,
  User,
} from '../../models'
import { ApplicationError } from '../../util/ApplicationError'

const include = [
  {
    model: StandaloneSurveyQuestion,
    as: 'surveyQuestions',
    include: [{ model: Question, as: 'question' }],
  },
  {
    model: StandaloneSurveyResponsibleUser,
    as: 'responsibleUsers',
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
  },
]

const order: any = [[{ model: StandaloneSurveyQuestion, as: 'surveyQuestions' }, 'position', 'ASC']]

export const getSurveyById = async (id: number) => {
  const survey = await StandaloneSurvey.findByPk(id, { include, order })
  if (!survey) throw ApplicationError.NotFound('Survey not found')
  return survey
}

export const getSurveyByToken = async (token: string) => {
  const survey = await StandaloneSurvey.findOne({ where: { token }, include, order })
  if (!survey) throw ApplicationError.NotFound('Survey not found')
  return survey
}

export const getQuestions = (survey: StandaloneSurvey) =>
  (survey.surveyQuestions ?? []).map(sq => sq.question!.toJSON() as QuestionJson)

export const getPublicQuestionIds = (survey: StandaloneSurvey) =>
  (survey.surveyQuestions ?? []).filter(sq => sq.visibility === 'PUBLIC').map(sq => sq.questionId)

export const getResponsibleUsers = (survey: StandaloneSurvey) =>
  (survey.responsibleUsers ?? []).map(ru => ru.user!.toJSON())
