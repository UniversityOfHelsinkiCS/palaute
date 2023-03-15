const { Router } = require('express')
const { ContinuousFeedback, UserFeedbackTarget } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { sendEmailContinuousFeedbackResponseToStudent } = require('../../mailer/mails')
const { getFeedbackTargetContext } = require('../../services/feedbackTargets')

const getStudentContinuousFeedbacks = async (user, feedbackTargetId) => {
  const userFeedbackTarget = await UserFeedbackTarget.scope('students').findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
  })

  if (!userFeedbackTarget) ApplicationError.Forbidden()

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
      userId: user.id,
    },
  })

  return continuousFeedbacks
}

const getFeedbacks = async (req, res) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)

  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSeeContinuousFeedbacks()) {
    const continuousFeedbacks = await getStudentContinuousFeedbacks(user, feedbackTargetId)

    return res.send(continuousFeedbacks)
  }

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
    },
  })

  return res.send(continuousFeedbacks)
}

const submitFeedback = async (req, res) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const { feedback } = req.body

  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canGiveContinuousFeedback()) ApplicationError.Forbidden('User not allowed to give continuous feedback')

  const { continuousFeedbackEnabled, sendContinuousFeedbackDigestEmail: sendInDigestEmail } = feedbackTarget

  if (!continuousFeedbackEnabled) ApplicationError.Forbidden('Continuous feedback is disabled')

  const continuousFeedbackIsOver = (await feedbackTarget.feedbackCanBeGiven()) || feedbackTarget.isEnded()

  if (continuousFeedbackIsOver) ApplicationError.Forbidden('Continuous feedback is closed')

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId: user.id,
    sendInDigestEmail,
  })

  return res.send(newFeedback)
}

const respondToFeedback = async (req, res) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)
  const { response } = req.body

  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canRespondToContinuousFeedback()) ApplicationError.Forbidden()

  const continuousFeedback = await ContinuousFeedback.findByPk(continuousFeedbackId)

  if (!response && !continuousFeedback.responseEmailSent) {
    throw new ApplicationError('Response missing', 400)
  }

  continuousFeedback.response = response
  await continuousFeedback.save()

  const { id, responseEmailSent } = continuousFeedback
  if (!responseEmailSent) {
    sendEmailContinuousFeedbackResponseToStudent(id)
  }

  return res.send(continuousFeedback)
}

const router = Router()

router.get('/:id', getFeedbacks)
router.post('/:id', submitFeedback)
router.post('/:id/response/:continuousFeedbackId', respondToFeedback)

module.exports = router
