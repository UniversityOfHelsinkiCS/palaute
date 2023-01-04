const { Access } = require('./Access')
const { getFeedbackTargetContext } = require('./util')

const getAccess = async ({ userFeedbackTarget, user, feedbackTarget }) => {
  if (user.dataValues.isAdmin) return Access.ADMIN

  const accessStatus = userFeedbackTarget?.accessStatus
  const { courseUnitId, courseRealisation } = feedbackTarget
  const startDate = new Date(courseRealisation?.startDate)

  if (accessStatus) {
    const access = Access.For(accessStatus)
    // Teachers are considered responsible teachers
    // for curs starting before 1.1.2023
    if (access === Access.TEACHER && startDate < new Date('2023-01-01')) {
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

const getAccessForUserById = async ({ feedbackTargetId, user }) => {
  const { feedbackTarget, userFeedbackTarget } = await getFeedbackTargetContext({ feedbackTargetId, user })
  const access = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
  })

  return access
}

module.exports = { getAccess, getAccessForUserById }
