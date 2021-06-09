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

export const saveValues = async (values, survey) => {
  const { questions } = values
  const { id } = survey

  const { data } = await apiClient.put(`/surveys/${id}`, { questions })

  return data
}
