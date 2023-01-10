import apiClient from '../../util/apiClient'

export const saveValues = async values => {
  const { feedback, responseWanted, anonymous } = values

  const { data } = await apiClient.post(`/norppa-feedback`, {
    feedback,
    responseWanted,
    anonymous,
  })

  return data
}
