const { Access } = require('./Access')

const getAccess = async ({ userFeedbackTarget, user, feedbackTarget }) => {
  if (user.dataValues.isAdmin) return Access.ADMIN

  const accessStatus = userFeedbackTarget?.accessStatus

  if (accessStatus) {
    return Access.For(accessStatus)
  }

  // User not directly associated. Lets check if they have access through organisation
  const organisationAccess = await user.getOrganisationAccessByCourseUnitId(feedbackTarget.courseUnitId)

  if (!organisationAccess) {
    return null
  }

  if (organisationAccess.admin) {
    return Access.ORGANISATION_ADMIN
  }

  return Access.ORGANISATION_READ
}

module.exports = { getAccess }
