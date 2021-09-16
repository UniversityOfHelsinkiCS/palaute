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
  const { origin } = window.location

  navigator.clipboard.writeText(`${origin}/targets/${feedbackTarget.id}`)
}

export const getCoursePageUrl = (feedbackTarget) =>
  `https://studies.helsinki.fi/opintotarjonta/cur/${feedbackTarget.courseRealisation.id}`
