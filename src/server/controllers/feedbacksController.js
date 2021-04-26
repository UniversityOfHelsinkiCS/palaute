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
    { feedbackId: newFeedback.id },
    { where: { userId, feedbackTargetId: Number(feedbackTargetId) } },
  )

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
