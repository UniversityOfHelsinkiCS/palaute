import apiClient from '../../../../util/apiClient'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'

export const saveContinuousFeedback = async (values, feedbackTargetId) => {
  const { feedback } = values

  const { data } = await apiClient.post(`/continuous-feedback/${feedbackTargetId}`, {
    feedback,
  })

  return data
}

export const sendContinuousFeedbackResponse = async (values, feedbackTargetId, continuousFeedbackId) => {
  const { response } = values

  const { data } = await apiClient.post(`/continuous-feedback/${feedbackTargetId}/response/${continuousFeedbackId}`, {
    response,
  })

  return data
}

export const feedbackTargetIsOngoing = feedbackTarget =>
  !feedbackTargetIsOpen(feedbackTarget) && !feedbackTargetIsEnded(feedbackTarget)
