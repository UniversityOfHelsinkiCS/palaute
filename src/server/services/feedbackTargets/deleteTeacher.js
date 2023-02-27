const { UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const cache = require('./cache')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const deleteTeacher = async ({ feedbackTargetId, teacherId, user }) => {
  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canDeleteTeacher()) ApplicationError.Forbidden()

  const userFeedbackTargetToDelete = await UserFeedbackTarget.findOne({
    where: {
      feedbackTargetId,
      userId: teacherId,
    },
  })

  if (!userFeedbackTargetToDelete) {
    ApplicationError.NotFound(`Teacher ${teacherId} not found on target ${feedbackTargetId}`)
  }

  await userFeedbackTargetToDelete.destroy()

  cache.invalidate(feedbackTargetId)
}

module.exports = {
  deleteTeacher,
}
