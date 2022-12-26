const getAccessStatus = async (
  userFeedbackTarget,
  user,
  feedbackTarget,
  isAdmin,
) => {
  let accessStatus = isAdmin ? 'ADMIN' : userFeedbackTarget?.accessStatus

  const { courseUnitId, courseRealisation } = feedbackTarget

  const startDate = new Date(courseRealisation.startDate)

  // Feedback visibility restricted to only responsible teachers
  // for CURs starting after 1.1.2023
  if (accessStatus === 'TEACHER' && startDate < new Date('2023-01-01')) {
    accessStatus = 'RESPONSIBLE_TEACHER'
  }

  if (!accessStatus) {
    // User not directly associated. Lets check if they have access through organisation
    const organisationAccess = await user.getOrganisationAccessByCourseUnitId(
      courseUnitId,
    )

    if (!organisationAccess) {
      return null
    }

    accessStatus = organisationAccess.admin
      ? 'ORGANISATION_ADMIN'
      : 'ORGANISATION'
  }

  return accessStatus
}

module.exports = { getAccessStatus }
