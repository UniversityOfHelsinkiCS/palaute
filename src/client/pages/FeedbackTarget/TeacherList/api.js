import apiClient from '../../../util/apiClient'
import queryClient from '../../../util/queryClient'

export const deleteResponsibleTeacher = async (feedbackTarget, teacher) => {
  await apiClient.delete(`/feedback-targets/${feedbackTarget.id}/user-feedback-targets/${teacher.id}`)
  queryClient.invalidateQueries(['feedbackTarget', String(feedbackTarget.id)])
}
