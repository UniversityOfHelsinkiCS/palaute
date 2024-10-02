const { Access } = require('./Access')

const getAccess = async ({ userFeedbackTarget, user, feedbackTarget }) => {
  if (user.dataValues.isAdmin) return Access.ADMIN

  const accessStatus = userFeedbackTarget?.accessStatus
  let uftAccess = null
  if (accessStatus) {
    uftAccess = Access.For(accessStatus)
  }

  // User not directly associated. Lets check if they have access through organisation
  const organisationAccess = await user.getOrganisationAccessByCourseUnitId(feedbackTarget.courseUnitId)

  let orgAccess = null
  if (organisationAccess) {
    if (organisationAccess.admin) {
      orgAccess = Access.ORGANISATION_ADMIN
    } else if (organisationAccess.read) {
      orgAccess = Access.ORGANISATION_READ
    }
  }

  // only direct access, return that
  if (uftAccess !== null && orgAccess === null) {
    return uftAccess
  }
  // access only through organisation, return that
  if (uftAccess === null && orgAccess !== null) {
    return orgAccess
  }
  // both direct access and access through organisation, return highest
  if (uftAccess !== null && orgAccess !== null) {
    if (orgAccess === Access.ORGANISATION_ADMIN) {
      if (uftAccess === Access.ADMIN || uftAccess === Access.RESPONSIBLE_TEACHER) {
        return uftAccess
      }
      return orgAccess
    }
    if (orgAccess === Access.ORGANISATION_READ) {
      if (uftAccess === Access.STUDENT) {
        return orgAccess
      }
      return uftAccess
    }
  }

  return null
}

module.exports = { getAccess }
