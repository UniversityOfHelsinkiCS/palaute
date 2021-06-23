import apiClient from '../../util/apiClient'

export const getUpperLevelQuestions = (survey) =>
  (survey?.universitySurvey?.questions ?? []).filter((q) => q.type !== 'TEXT')

export const getSurveyInitialValues = (survey) => {
  const questions = [
    ...(survey.universitySurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: false,
      chip: 'questionEditor:universityQuestion',
    })),
    ...(survey.questions ?? []).map((question) => ({
      ...question,
      editable: true,
    })),
  ]
  return {
    questions,
  }
}

export const saveSurveyValues = async (values, surveyId) => {
  const { questions } = values
  const editableQuestions = questions.filter(({ editable }) => editable)

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions: editableQuestions,
  })

  return data
}
