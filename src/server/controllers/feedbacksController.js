const { ApplicationError } = require('../util/customErrors')
const { UserFeedbackTarget, Feedback } = require('../models')

const getAll = async (req, res) => {
  const feedbacks = await Feedback.findAll()
  res.send(feedbacks)
}

const create = async (req, res) => {
  const { answers, targetId } = req.body
  const newFeedback = await Feedback.create({
    data: answers,
    userId: req.user.id,
  })

  const userFeedbackTarget = await UserFeedbackTarget.update(
    { feedbackId: Number(newFeedback.id) },
    { where: { id: Number(targetId) } },
  )

  res.send(userFeedbackTarget)
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

const getFeedbackByCourseId = async (req, res) => {
  const feedbacks = await Feedback.findAll({
    where: {
      courseRealisationId: req.params.id,
    },
  })

  if (!feedbacks) throw new ApplicationError('Not found', 404)

  res.send(feedbacks)
}

const update = async (req, res) => {
  const feedbackTarget = await UserFeedbackTarget.findByPk(
    Number(req.params.id),
  )
  if (!feedbackTarget) throw new ApplicationError('Not found', 404)
  const { feedbackId } = feedbackTarget
  const feedback = await Feedback.findByPk(Number(feedbackId))
  feedback.data = req.body
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
  getAll,
  getFeedbackByUser,
  getFeedbackByCourseId,
  getFeedbackByUserAndCourseId,
  getOne,
  create,
  update,
  destroy,
}
