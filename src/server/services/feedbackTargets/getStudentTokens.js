const jwt = require('jsonwebtoken')

const { UserFeedbackTarget, User } = require('../../models')
const { JWT_KEY } = require('../../util/config')
const { ApplicationError } = require('../../util/customErrors')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')

const getStudentTokens = async ({ feedbackTargetId, user }) => {
  const { access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeTokens()) ApplicationError.Forbidden()

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
    },
    include: [
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
  })

  const users = userFeedbackTargets.map(({ user }) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    studentNumber: user.studentNumber,
    token: jwt.sign({ username: user.username }, JWT_KEY),
  }))

  return users
}

module.exports = {
  getStudentTokens,
}
