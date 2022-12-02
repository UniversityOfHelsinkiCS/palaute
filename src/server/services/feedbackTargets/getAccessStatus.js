const getAccessStatus = async (
  userFeedbackTarget,
  user,
  feedbackTarget,
  isAdmin,
) => {
  let accessStatus = isAdmin ? 'ADMIN' : userFeedbackTarget?.accessStatus

  if (!accessStatus) {
    // User not directly associated. Lets check if they have access through organisation
    const organisationAccess = await user.getOrganisationAccessByCourseUnitId(
      feedbackTarget.courseUnitId,
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
