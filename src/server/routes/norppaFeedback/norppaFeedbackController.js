const { Router } = require('express')
const { NorppaFeedback, User } = require('../../models')
const { ADMINS } = require('../../../config')
const { ApplicationError } = require('../../util/customErrors')

const submitFeedback = async (req, res) => {
  const { user } = req

  if (!user) return res.send([])

  const { feedback, responseWanted } = req.body

  const newFeedback = await NorppaFeedback.create({
    data: feedback,
    responseWanted,
    userId: user.id,
  })

  const feedbackUser = await User.findByPk(user.id)
  feedbackUser.norppaFeedbackGiven = true
  await feedbackUser.save()

  return res.send(newFeedback)
}

const hideBanner = async (req, res) => {
  const { user } = req

  if (!user) return res.sendStatus(500)

  const acualUser = await User.findByPk(user.id)
  acualUser.norppaFeedbackGiven = true
  await acualUser.save()

  return res.sendStatus(200)
}

const getFeedbacks = async (req, res) => {
  const { user } = req

  if (!user) return res.sendStatus(500)
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

  return res.send(feedbacks)
}

const markAsSolved = async (req, res) => {
  const { user } = req
  const { id } = req.params

  if (!user) return res.sendStatus(500)
  if (!ADMINS.includes(user.username))
    throw new ApplicationError('Forbidden', 403)

  const { solved } = req.body
  if (typeof solved !== 'boolean')
    throw new ApplicationError(
      'Invalid data: missing "solved" boolean field',
      400,
    )

  const feedback = await NorppaFeedback.findByPk(id)
  feedback.solved = solved
  await feedback.save()

  return res.sendStatus(200)
}

const getNorppaFeedbackCount = async (req, res) => {
  const { user } = req

  if (!user) return res.sendStatus(500)
  if (!ADMINS.includes(user.username)) {
    return res.send(403)
  }

  const feedbacks = await NorppaFeedback.count({
    where: {
      solved: false,
      responseWanted: true,
    },
  })

  return res.send({ count: feedbacks })
}

const router = Router()

router.get('/', getFeedbacks)
router.post('/', submitFeedback)
router.put('/hide', hideBanner)
router.put('/:id', markAsSolved)
router.get('/count', getNorppaFeedbackCount)

module.exports = router
