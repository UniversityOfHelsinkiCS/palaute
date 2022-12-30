const { Router } = require('express')
const {
  ContinuousFeedback,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const {
  sendEmailContinuousFeedbackResponseToStudent,
} = require('../../mailer/mails')
const { getFeedbackTargetAccess } = require('../../services/feedbackTargets')

const getStudentContinuousFeedbacks = async (user, feedbackTargetId) => {
  const userFeedbackTarget = await UserFeedbackTarget.scope('students').findOne(
    {
      where: {
        userId: user.id,
        feedbackTargetId,
      },
    },
  )

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
  const { user, isAdmin } = req

  const feedbackTargetId = Number(req.params.id)

  const access = await getFeedbackTargetAccess({
    feedbackTargetId,
    user,
    isAdmin,
  })

  if (!access?.canSeeContinuousFeedbacks()) {
    const continuousFeedbacks = await getStudentContinuousFeedbacks(
      user,
      feedbackTargetId,
    )

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
  const { id: userId } = req.user

  const feedbackTargetId = Number(req.params.id)
  const { feedback } = req.body

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  const {
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail: sendInDigestEmail,
  } = feedbackTarget

  if (!continuousFeedbackEnabled)
    ApplicationError.Forbidden('Continuous feedback is disabled')

  const continuousFeedbackCanBeGiven =
    (await feedbackTarget.feedbackCanBeGiven()) || feedbackTarget.isEnded()

  if (!continuousFeedbackCanBeGiven)
    ApplicationError.Forbidden('Continuous feedback is closed')

  const userFeedbackTarget = await UserFeedbackTarget.scope('students').findOne(
    {
      where: {
        userId,
        feedbackTargetId,
      },
    },
  )

  if (!userFeedbackTarget) ApplicationError.Forbidden()

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId,
    sendInDigestEmail,
  })

  return res.send(newFeedback)
}

const respondToFeedback = async (req, res) => {
  const { user, isAdmin } = req

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)
  const { response } = req.body

  if (!response) {
    throw new ApplicationError('Response missing', 400)
  }

  const access = await getFeedbackTargetAccess({
    feedbackTargetId,
    user,
    isAdmin,
  })

  if (!access?.canRespondToContinuousFeedback()) ApplicationError.Forbidden()

  const continuousFeedback = await ContinuousFeedback.findByPk(
    continuousFeedbackId,
  )

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
