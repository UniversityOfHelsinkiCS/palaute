import type { QuestionAnswer } from '@common/types/question'

import { StandaloneSurvey, StandaloneSurveyResponse, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { validateAnswers } from '../../util/feedbackValidator'
import { getPublicFeedbacks, shuffleFeedbacks } from '../../util/shuffleFeedbacks'
import { getPublicQuestionIds, getQuestions } from './getSurvey'

export const getOwnResponse = (survey: StandaloneSurvey, user: User) =>
  StandaloneSurveyResponse.findOne({ where: { standaloneSurveyId: survey.id, userId: user.id } })

const assertCanAnswer = (survey: StandaloneSurvey) => {
  if (!survey.isOpen()) throw ApplicationError.Forbidden('Survey is not open')
}

export const saveResponse = async (survey: StandaloneSurvey, user: User, data: QuestionAnswer[]) => {
  assertCanAnswer(survey)

  const cleanData = data.map(({ questionId, data: answer }) => ({ questionId, data: answer }))
  if (!validateAnswers(cleanData, getQuestions(survey))) throw ApplicationError.BadRequest('Form data not valid')

  const [response, created] = await StandaloneSurveyResponse.findOrCreate({
    where: { standaloneSurveyId: survey.id, userId: user.id },
    defaults: { standaloneSurveyId: survey.id, userId: user.id, data: cleanData },
  })
  if (!created) {
    const isHidden = (answer: QuestionAnswer) =>
      response.data.some(
        previous => previous.hidden && previous.questionId === answer.questionId && previous.data === answer.data
      )
    response.data = cleanData.map(answer => (isHidden(answer) ? { ...answer, hidden: true } : answer))
    await response.save()
  }

  return response
}

export const deleteResponse = async (survey: StandaloneSurvey, user: User) => {
  assertCanAnswer(survey)
  await StandaloneSurveyResponse.destroy({ where: { standaloneSurveyId: survey.id, userId: user.id } })
}

export const canSeePublicResults = (survey: StandaloneSurvey, hasResponded: boolean) =>
  survey.isEnded() || (survey.isOpen() && hasResponded)

export const getResults = async (survey: StandaloneSurvey, { publicOnly }: { publicOnly: boolean }) => {
  const responses = await StandaloneSurveyResponse.findAll({
    where: { standaloneSurveyId: survey.id },
    attributes: ['data'],
  })

  const questionIds = getQuestions(survey)
    .filter(q => q.type !== 'TEXT')
    .map(q => q.id)

  const shuffled = shuffleFeedbacks(
    responses.map(r => ({ data: r.data })),
    questionIds
  )
  const feedbacks = publicOnly ? getPublicFeedbacks(shuffled, getPublicQuestionIds(survey)) : shuffled

  return { feedbacks, responseCount: responses.length }
}
