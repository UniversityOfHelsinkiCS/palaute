import apiClient from '../../util/apiClient'

export type NorppaFeedbackFormValues = {
  feedback: string
  responseWanted: boolean
  anonymous: boolean
}

export const saveValues = async (values: NorppaFeedbackFormValues) => {
  const { feedback, responseWanted, anonymous } = values

  const { data } = await apiClient.post('/norppa-feedback', {
    feedback,
    responseWanted,
    anonymous,
  })

  return data
}
