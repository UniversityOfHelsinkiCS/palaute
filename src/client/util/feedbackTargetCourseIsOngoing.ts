type FeedbackTargetCourseIsOngoingParams = {
  courseRealisation?: { startDate?: string }
  opensAt?: string
}

const feedbackTargetCourseIsOngoing = ({ courseRealisation, opensAt }: FeedbackTargetCourseIsOngoingParams) => {
  if (!courseRealisation) return false
  const { startDate } = courseRealisation

  if (!startDate || !opensAt) return false

  const now = new Date()

  return new Date(startDate) < now && now < new Date(opensAt)
}

export default feedbackTargetCourseIsOngoing
