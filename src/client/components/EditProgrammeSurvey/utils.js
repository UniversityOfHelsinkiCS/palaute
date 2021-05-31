import apiClient from '../../util/apiClient'

export const getInitialValues = (survey) => {
  const questions = survey?.questions ?? []

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

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions,
  })

  return data
}
