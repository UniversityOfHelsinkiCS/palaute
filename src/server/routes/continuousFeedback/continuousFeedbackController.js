const { Router } = require('express')
const { Op } = require('sequelize')
const {
  ContinuousFeedback,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const getStudentContinuousFeedbacks = async (user, feedbackTargetId) => {
  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
      accessStatus: { [Op.in]: ['STUDENT'] },
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Forbidden', 403)

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

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
      accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
    },
  })

  if (!userFeedbackTarget && !isAdmin) {
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
    throw new ApplicationError('Continuous feedback is disabled', 400)

  const feedbackCanBeGiven =
    (await feedbackTarget.feedbackCanBeGiven()) || feedbackTarget.isEnded()

  if (feedbackCanBeGiven)
    throw new ApplicationError('Continuous feedback is closed', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId,
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId,
    sendInDigestEmail,
  })

  return res.send(newFeedback)
}

const respondToFeedback = async (req, res) => {
  const { id: userId } = req.user

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)
  const { response } = req.body

  if (!response) {
    throw new ApplicationError('Response missing', 404)
  }

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId,
      feedbackTargetId,
      accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Forbidden', 403)

  const continuousFeedback = await ContinuousFeedback.findByPk(
    continuousFeedbackId,
  )

  continuousFeedback.response = response
  await continuousFeedback.save()

  return res.send(continuousFeedback)
}

const router = Router()

router.get('/:id', getFeedbacks)
router.post('/:id', submitFeedback)
router.post('/:id/response/:continuousFeedbackId', respondToFeedback)

module.exports = router
