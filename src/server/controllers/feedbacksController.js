const { ApplicationError } = require('../util/customErrors')
const { Feedback } = require('../models')

const getAll = async (req, res) => {
  const feedbacks = await Feedback.findAll()
  res.send(feedbacks)
}

const create = async (req, res) => {
  const newFeedback = await Feedback.create({
    data: req.body.data,
    userId: req.user.id,
    courseRealisationId: req.body.courseId,
  })

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
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  feedback.data = req.body.data
  const updatedFeedback = await feedback.save()
  res.send(updatedFeedback)
}

const destroy = async (req, res) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

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
