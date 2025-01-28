const { Access } = require('./Access')

const getAccess = async ({ userFeedbackTarget, user, feedbackTarget }) => {
  const accesses = []

  if (user.dataValues.isAdmin) {
    accesses.push(Access.ADMIN)
  }

  const accessStatus = userFeedbackTarget?.accessStatus
  if (accessStatus) {
    accesses.push(Access.For(accessStatus))
  }

  // User not directly associated. Let's check if they have access through organisation
  const organisationAccess = await user.getOrganisationAccessByCourseUnitId(feedbackTarget.courseUnitId)
  if (organisationAccess) {
    if (organisationAccess.admin) {
      accesses.push(Access.ORGANISATION_ADMIN)
    } else if (organisationAccess.read) {
      accesses.push(Access.ORGANISATION_READ)
    }
  }

  if (accesses.length === 0) {
    return Access.NONE
  }

  // Merge all accesses into one Access object
  return Access.mergeAccesses(accesses)
}

module.exports = { getAccess }
