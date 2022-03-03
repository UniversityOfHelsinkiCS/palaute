import apiClient from '../../util/apiClient'

export const saveValues = async (values) => {
  const { feedback, responseWanted } = values

  const { data } = await apiClient.post(`/norppa-feedback`, {
    feedback,
    responseWanted,
  })

  return data
}
