const { RESPONSIBLE_TEACHERS_SPLIT_DATE } = require('../../util/config')
const { Access } = require('./Access')

const getAccess = async ({ userFeedbackTarget, user, feedbackTarget }) => {
  if (user.dataValues.isAdmin) return Access.ADMIN

  const accessStatus = userFeedbackTarget?.accessStatus
  const { courseUnitId, courseRealisation } = feedbackTarget
  const startDate = new Date(courseRealisation?.startDate)

  if (accessStatus) {
    const access = Access.For(accessStatus)
    console.log('The object', RESPONSIBLE_TEACHERS_SPLIT_DATE.getMonth())
    if (access === Access.TEACHER && startDate < RESPONSIBLE_TEACHERS_SPLIT_DATE) {
      return Access.RESPONSIBLE_TEACHER
    }
    return access
  }

  // User not directly associated. Lets check if they have access through organisation
  const organisationAccess = await user.getOrganisationAccessByCourseUnitId(courseUnitId)

  if (!organisationAccess) {
    return null
  }

  if (organisationAccess.admin) {
    return Access.ORGANISATION_ADMIN
  }

  return Access.ORGANISATION_READ
}

module.exports = { getAccess }
