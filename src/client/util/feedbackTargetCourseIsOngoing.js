const feedbackTargetCourseIsOngoing = ({ courseRealisation, opensAt }) => {
  if (!courseRealisation) return false
  const { startDate } = courseRealisation

  if (!startDate || !opensAt) return false

  const now = new Date()

  return new Date(startDate) < now && now < new Date(opensAt)
}

export default feedbackTargetCourseIsOngoing
