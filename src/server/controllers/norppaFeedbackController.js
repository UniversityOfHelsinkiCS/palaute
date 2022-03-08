const { NorppaFeedback, User } = require('../models')

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

module.exports = { submitFeedback, hideBanner }
