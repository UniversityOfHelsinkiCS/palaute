import apiClient from '../../util/apiClient'

export const sendContinuousFeedbackResponse = async (
  values,
  feedbackTargetId,
  continuousFeedbackId,
) => {
  const { response } = values

  const { data } = await apiClient.post(
    `/continuous-feedback/${feedbackTargetId}/response/${continuousFeedbackId}`,
    {
      response,
    },
  )

  return data
}
