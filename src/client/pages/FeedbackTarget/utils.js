export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget => {
  const { courseCode } = feedbackTarget.courseUnit

  // There are course codes that include slash character (/), which is problematic in req parameter
  // Slash is replaced with tilde (~) here and replaced back before querying database
  // Tilde should not be used in any course codes
  const safeCourseCode = courseCode.replace('/', '~')

  const summaryPath = `/course-summary/course-unit/${safeCourseCode}`

  return summaryPath
}
