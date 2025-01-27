export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget =>
  `/course-summary/course-unit/${feedbackTarget.courseUnit.courseCode}`
