import { parseISO, format } from 'date-fns'

import apiClient from '../../util/apiClient'

export const feedbackTargetIsDisabled = (feedbackTarget) => {
  const { courseUnit } = feedbackTarget
  const organisations = courseUnit?.organisations ?? []

  return organisations.some(({ disabledCourseCodes }) =>
    disabledCourseCodes.includes(courseUnit.courseCode),
  )
}

export const getCoursePeriod = (courseRealisation) => {
  if (!courseRealisation) {
    return null
  }

  const startDate = format(parseISO(courseRealisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(courseRealisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}

export const getFeedbackPeriod = (feedbackTarget) => {
  const opensAt = format(parseISO(feedbackTarget.opensAt), 'dd.MM.yyyy')
  const closesAt = format(parseISO(feedbackTarget.closesAt), 'dd.MM.yyyy')

  return `${opensAt} - ${closesAt}`
}

export const copyLink = (link) => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = (feedbackTarget) =>
  `/course-summary/${feedbackTarget.courseUnit.courseCode}`

export const deleteResponsibleTeacher = async (feedbackTarget, teacher) => {
  await apiClient.delete(
    `/feedback-targets/${feedbackTarget.id}/user-feedback-targets/${teacher.id}`,
  )
}
