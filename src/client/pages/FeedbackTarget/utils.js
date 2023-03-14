import apiClient from '../../util/apiClient'

export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget => `/course-summary/${feedbackTarget.courseUnit.courseCode}`

export const deleteResponsibleTeacher = async (feedbackTarget, teacher) => {
  await apiClient.delete(`/feedback-targets/${feedbackTarget.id}/user-feedback-targets/${teacher.id}`)
}
