const { ApplicationError } = require('../util/customErrors')
const { UserFeedbackTarget, FeedbackTarget, Feedback } = require('../models')

const create = async (req, res) => {
  const { data, feedbackTargetId } = req.body
  const { id: userId } = req.user

  const feedbackTarget = await FeedbackTarget.findByPk(Number(feedbackTargetId))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  if (!feedbackTarget.isOpen())
    throw new ApplicationError('Feedback is not open', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId,
      feedbackTargetId: feedbackTarget.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)
  if (userFeedbackTarget.feedbackId)
    throw new ApplicationError(
      'Attempt to create new feedback where one already exists. Use PUT to update the old',
      400,
    )

  const newFeedback = await Feedback.create({
    data,
    userId,
  })

  userFeedbackTarget.feedbackId = newFeedback.id
  await userFeedbackTarget.save()

  res.send(newFeedback)
}

const getFeedbackForUser = async (req) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
    },
  })

  if (!feedbackTarget) throw new ApplicationError('Forbidden', 403)

  return feedback
}

const getOne = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  res.send(feedback)
}

const update = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await FeedbackTarget.findByPk(
    userFeedbackTarget.feedbackTargetId,
  )

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  if (!feedbackTarget.isOpen())
    throw new ApplicationError('Feedback is not open', 403)

  feedback.data = req.body.data

  const updatedFeedback = await feedback.save()

  res.send(updatedFeedback)
}

const destroy = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  await feedback.destroy()
  res.sendStatus(200)
}

module.exports = {
  getOne,
  create,
  update,
  destroy,
}
