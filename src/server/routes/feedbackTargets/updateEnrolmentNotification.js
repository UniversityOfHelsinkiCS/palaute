const { FeedbackTarget } = require('../../models')
const { requestEnrolmentNotification } = require('../../services/enrolmentNotices/enrolmentNotices')
const { ApplicationError } = require('../../util/customErrors')

const updateEnrolmentNotification = async (req, res) => {
  const { user } = req
  const { id } = req.params
  const { enabled: enabledRaw } = req.body
  const enabled = Boolean(enabledRaw)

  const feedbackTarget = await FeedbackTarget.findByPk(id)
  if (!feedbackTarget) {
    throw new ApplicationError('Not found', 404)
  }
  // Could check if enrolment already exists, but it doesnt really matter... the notification will just expire anyways.
  await requestEnrolmentNotification(user.id, feedbackTarget.id, enabled)

  return res.send({ enabled, email: user.getDefaultEmail() })
}

module.exports = updateEnrolmentNotification
