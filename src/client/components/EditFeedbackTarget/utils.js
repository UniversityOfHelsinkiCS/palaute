import { startOfDay, endOfDay } from 'date-fns'

import apiClient from '../../util/apiClient'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import queryClient from '../../util/queryClient'
import { copyQuestion } from '../QuestionEditor/utils'

export const getUpperLevelQuestions = feedbackTarget => {
  const { universitySurvey, programmeSurveys } = feedbackTarget.surveys ?? {}

  return [...(universitySurvey?.questions ?? []), ...(programmeSurveys?.questions ?? [])]
}

export const getQuestionsInitialValues = feedbackTarget => {
  const { surveys, publicQuestionIds, publicityConfigurableQuestionIds } = feedbackTarget

  const programmeSurveyQuestions = surveys.programmeSurveys.reduce(
    (questions, survey) => questions.concat(survey.questions),
    []
  )

  const questions = [
    ...(surveys.universitySurvey?.questions ?? []).map(question => ({
      ...question,
      editable: false,
      public: publicQuestionIds.includes(question.id),
      publicityConfigurable: publicityConfigurableQuestionIds.includes(question.id),
      chip: 'questionEditor:universityQuestion',
    })),
    ...(programmeSurveyQuestions ?? []).map(question => ({
      ...question,
      editable: false,
      public: publicQuestionIds.includes(question.id),
      publicityConfigurable: publicityConfigurableQuestionIds.includes(question.id),
      chip: 'questionEditor:programmeQuestion',
    })),
    ...(surveys.teacherSurvey?.questions ?? []).map(question => ({
      ...question,
      editable: true,
      public: publicQuestionIds.includes(question.id),
      publicityConfigurable: publicityConfigurableQuestionIds.includes(question.id),
    })),
  ]

  return {
    questions,
  }
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

export const saveQuestionsValues = async (values, feedbackTarget) => {
  const { questions } = values
  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const editableQuestions = questions.filter(({ editable }) => editable)

  const payload = {
    surveyId,
    questions: editableQuestions,
  }
  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  const { questions: updatedQuestions } = data
  if (updatedQuestions && Array.isArray(updatedQuestions) && updatedQuestions.length > 0) {
    // update cache
    queryClient.refetchQueries(['feedbackTarget', String(id)])
  }

  return data
}

export const copyQuestionsFromFeedbackTarget = feedbackTarget => {
  const questions = feedbackTarget.surveys?.teacherSurvey?.questions ?? []

  return questions.map(q => ({
    ...copyQuestion(q),
    editable: true,
  }))
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

export const validateQuestions = values => {
  const { questions } = values

  const editableQuestions = questions.filter(({ editable }) => editable)

  for (const question of editableQuestions) {
    if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
      if (!question.data.options || question.data.options.length < 1) return false
    }
  }
  return true
}
