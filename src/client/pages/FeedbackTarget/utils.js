import { getSafeCourseCode } from '../../util/courseIdentifiers'

export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget => {
  const safeCourseCode = getSafeCourseCode({ courseCode: feedbackTarget?.courseUnit?.courseCode })

  const summaryPath = `/course-summary/course-unit/${safeCourseCode}`

  return summaryPath
}
