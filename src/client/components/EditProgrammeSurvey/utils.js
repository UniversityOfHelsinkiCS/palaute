import apiClient from '../../util/apiClient'

export const getInitialValues = (survey) => {
  const questions = [
    ...(survey.universitySurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: false,
      chip: 'editFeedbackTarget:universityQuestion',
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

export const validate = () => {
  const errors = {}

  return errors
}

export const saveValues = async (values, surveyId) => {
  const { questions } = values
  const editableQuestions = questions.filter(({ editable }) => editable)

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions: editableQuestions,
  })

  return data
}
