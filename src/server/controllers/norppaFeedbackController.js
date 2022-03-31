const { NorppaFeedback, User } = require('../models')
const { ADMINS } = require('../../config')
const ApplicationError = require('../util/customErrors')

const submitFeedback = async (req, res) => {
  const { user } = req

  if (!user) res.send([])

  const { feedback, responseWanted } = req.body

  const newFeedback = await NorppaFeedback.create({
    data: feedback,
    responseWanted,
    userId: user.id,
  })

  const feedbackUser = await User.findByPk(user.id)
  feedbackUser.norppaFeedbackGiven = true
  await feedbackUser.save()

  res.send(newFeedback)
}

const hideBanner = async (req, res) => {
  const { user } = req

  if (!user) res.sendStatus(500)

  const acualUser = await User.findByPk(user.id)
  acualUser.norppaFeedbackGiven = true
  await acualUser.save()

  res.sendStatus(200)
}

const getFeedbacks = async (req, res) => {
  const { user } = req

  if (!user) res.sendStatus(500)
  if (!ADMINS.includes(user.username))
    throw new ApplicationError('Forbidden', 403)

  const feedbacks = await NorppaFeedback.findAll({
    include: [
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
  })

  res.send(feedbacks)
}

const markAsSolved = async (req, res) => {
  const { user } = req
  const { id } = req.params

  if (!user) res.sendStatus(500)
  if (!ADMINS.includes(user.username))
    throw new ApplicationError('Forbidden', 403)

  const feedback = await NorppaFeedback.findByPk(id)
  feedback.responseWanted = false
  await feedback.save()

  res.sendStatus(200)
}

const getNorppaFeedbackCount = async (req, res) => {
  const { user } = req

  if (!user) res.sendStatus(500)
  if (!ADMINS.includes(user.username)) {
    return res.send(403)
  }

  const feedbacks = await NorppaFeedback.count({
    where: {
      responseWanted: true,
    },
  })

  const count = feedbacks ? feedbacks.length : null

  return res.send({ count })
}

module.exports = {
  submitFeedback,
  hideBanner,
  getFeedbacks,
  markAsSolved,
  getNorppaFeedbackCount,
}
