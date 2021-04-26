const { ApplicationError } = require('../util/customErrors')
const { UserFeedbackTarget, Feedback } = require('../models')

const create = async (req, res) => {
  const { data, feedbackTargetId } = req.body
  const { id: userId } = req.user

  const newFeedback = await Feedback.create({
    data,
    userId,
  })

  await UserFeedbackTarget.update(
    { feedbackId: Number(newFeedback.id) },
    { where: { userId, feedbackTargetId: Number(feedbackTargetId) } },
  )

  res.send(newFeedback)
}

const getOne = async (req, res) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  res.send(feedback)
}

const getFeedbackByUser = async (req, res) => {
  const { user } = req
  if (!user) throw new ApplicationError('Not found', 404)

  const { id } = user

  const feedbacks = await Feedback.findAll({
    where: {
      userId: id,
    },
  })
  if (!feedbacks) throw new ApplicationError('Not found', 404)

  res.send(feedbacks)
}

const getFeedbackByUserAndCourseId = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const { id } = user

  const feedbacks = await Feedback.findOne({
    where: {
      userId: id,
      surveyId: req.params.id,
    },
  })
  if (!feedbacks) throw new ApplicationError('Not found', 404)

  res.send(feedbacks)
}

const update = async (req, res) => {
  const { id } = req.params

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: Number(id),
    },
  })

  if (feedbackTarget?.userId !== req.user.id) {
    throw new ApplicationError(
      'User is not authorized to update the feedback',
      403,
    )
  }

  const feedback = await Feedback.findByPk(Number(id))

  feedback.data = req.body.data

  const updatedFeedback = await feedback.save()

  res.send(updatedFeedback)
}

const destroy = async (req, res) => {
  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: Number(req.params.id),
    },
  })
  if (!feedbackTarget) throw new ApplicationError('Not found', 404)
  const { feedbackId } = feedbackTarget
  feedbackTarget.feedbackId = null
  await feedbackTarget.save()
  const feedback = await Feedback.findByPk(Number(feedbackId))
  await feedback.destroy()

  res.sendStatus(200)
}

module.exports = {
  getFeedbackByUser,
  getFeedbackByUserAndCourseId,
  getOne,
  create,
  update,
  destroy,
}
