const feedbackTargetCourseIsOngoing = ({ courseRealisation }) => {
  const { startDate, endDate } = courseRealisation

  if (!startDate || !endDate) return false

  const now = new Date()

  return new Date(startDate) < now && now < new Date(endDate)
}

export default feedbackTargetCourseIsOngoing
