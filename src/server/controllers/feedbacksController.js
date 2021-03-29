const { ApplicationError } = require('../util/customErrors')
const { Feedback } = require('../models')

const getAll = async (req, res) => {
  const feedbacks = await Feedback.findAll()
  res.send(feedbacks)
}

const create = async (req, res) => {
  const newFeedback = await Feedback.create({
    data: req.body.data,
    userId: req.currentUser.id,
  })

  res.send(newFeedback)
}

const getOne = async (req, res) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  res.send(feedback)
}

const getFeedbackByUser = async (req, res) => {
  const feedback = await Feedback.findOne({
    where: {
      userId: req.params.uid,
    }
  })
  if (!feedback) throw new ApplicationError('Not found', 404)

  res.send(feedback)
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
  getOne,
  create,
  update,
  destroy,
}
