const { UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./cache')
const { getAccessForUserById } = require('./getAccess')

const deleteTeacher = async ({ feedbackTargetId, teacherId, user, isAdmin }) => {
  const access = await getAccessForUserById({
    feedbackTargetId,
    user,
    isAdmin,
  })

  if (!access?.canDeleteTeacher()) ApplicationError.Forbidden()

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackTargetId,
      userId: teacherId,
    },
  })

  if (!userFeedbackTarget) {
    ApplicationError.NotFound(`Teacher ${teacherId} not found on target ${feedbackTargetId}`, 404)
  }

  await userFeedbackTarget.destroy()

  cache.invalidate(feedbackTargetId)
}

module.exports = {
  deleteTeacher,
}
