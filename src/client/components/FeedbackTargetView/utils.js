import { parseISO, format } from 'date-fns'

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

export const copyLink = (feedbackTarget) => {
  const { host } = window.location

  const basePath = host.includes('localhost') ? host : `${host}/palaute`

  navigator.clipboard.writeText(
    `${window.location.protocol}//${basePath}/targets/${feedbackTarget.id}`,
  )
}
