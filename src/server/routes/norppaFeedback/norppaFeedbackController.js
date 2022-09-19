const { Router } = require('express')
const { NorppaFeedback, User } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { adminAccess } = require('../../middleware/adminAccess')

const submitFeedback = async (req, res) => {
  const { user } = req

  if (!user) return res.send([])

  const { feedback, anonymous, responseWanted } = req.body

  const newFeedback = await NorppaFeedback.create({
    data: feedback,
    responseWanted,
    userId: anonymous ? null : user.id,
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
  const feedbacks = await NorppaFeedback.findAll({
    include: [
      {
        model: User,
        as: 'user',
        required: false,
      },
    ],
  })

  return res.send(feedbacks)
}

const markAsSolved = async (req, res) => {
  const { id } = req.params

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
  const feedbacks = await NorppaFeedback.count({
    where: {
      solved: false,
      responseWanted: true,
    },
  })

  return res.send({ count: feedbacks })
}

const router = Router()

router.get('/', getFeedbacks, adminAccess)
router.post('/', submitFeedback)
router.put('/hide', hideBanner)
router.put('/:id', markAsSolved, adminAccess)
router.get('/count', getNorppaFeedbackCount, adminAccess)

module.exports = router
