const { Group, UserFeedbackTarget, User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const getGroups = async ({ feedbackTargetId, user }) => {
  const { access } = await getFeedbackTargetContext({ feedbackTargetId, user })
  if (!access.canSeeAllFeedbacks()) ApplicationError.Forbidden()

  const [groups, userFeedbackTargets] = await Promise.all([
    Group.findAll({ where: { feedbackTargetId } }),
    UserFeedbackTarget.findAll({
      where: { feedbackTargetId },
      include: { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
    }),
  ])

  return groups.map(group => ({
    ...group.toJSON(),
    studentCount: userFeedbackTargets.filter(ufbt => ufbt.hasStudentAccess() && ufbt.groupIds?.includes(group.id))
      .length,
    teachers: userFeedbackTargets
      .filter(ufbt => ufbt.hasTeacherAccess() && ufbt.groupIds?.includes(group.id))
      .map(ufbt => ufbt.user),
  }))
}

module.exports = { getGroups }
