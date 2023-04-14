export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget => `/course-summary/${feedbackTarget.courseUnit.courseCode}`
