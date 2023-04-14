import apiClient from '../../../util/apiClient'

export const deleteResponsibleTeacher = async (feedbackTarget, teacher) => {
  await apiClient.delete(`/feedback-targets/${feedbackTarget.id}/user-feedback-targets/${teacher.id}`)
}
