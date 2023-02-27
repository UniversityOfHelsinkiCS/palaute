import { startOfDay, endOfDay } from 'date-fns'

import apiClient from '../../../../../util/apiClient'
import feedbackTargetIsOpen from '../../../../../util/feedbackTargetIsOpen'

export const getUpperLevelQuestions = feedbackTarget => {
  const { universitySurvey, programmeSurveys } = feedbackTarget.surveys ?? {}

  return [...(universitySurvey?.questions ?? []), ...(programmeSurveys?.questions ?? [])]
}

export const saveFeedbackPeriodValues = async (values, feedbackTarget) => {
  const closesAt = values.closesAt ? endOfDay(new Date(values.closesAt)) : null
  const opensAt = values.opensAt ? startOfDay(new Date(values.opensAt)) : null

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    closesAt,
    opensAt,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}

export const feedbackTargetIsOpenOrClosed = feedbackTarget => {
  const closesAt = new Date(feedbackTarget.closesAt)

  return new Date() > closesAt || feedbackTargetIsOpen(feedbackTarget)
}

export const getOrganisationNames = (feedbackTarget, language) => {
  const { organisations } = feedbackTarget.courseUnit

  if (!organisations) return { primaryOrganisation: 'Helsingin yliopisto' }

  if (organisations.length === 1)
    return {
      primaryOrganisation: organisations[0].name[language].replace("'", '`'),
    }

  const lastCode = organisations[organisations.length - 1].code

  const allOrganisations = organisations.reduce((a, b) => {
    if (b.code === lastCode) return `${a}${b.name[language].replace("'", '`')}`
    return `${a}${b.name[language].replace("'", '`')}, `
  }, '')

  return {
    allOrganisations,
  }
}
