const { Router } = require('express')
const { ContinuousFeedback, FeedbackTarget } = require('../../models')
const { adminAccess } = require('../../middleware/adminAccess')
const { ApplicationError } = require('../../util/customErrors')

const getFeedbacks = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
    },
  })

  return res.send(continuousFeedbacks)
}

const submitFeedback = async (req, res) => {
  const { user } = req.user

  if (!user) return res.send([])

  const feedbackTargetId = Number(req.params.id)
  const { feedback } = req.body

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  if (!feedbackTarget.continuousFeedbackEnabled)
    throw new ApplicationError('Continuous feedback is disabled', 400)

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId: user.id,
  })

  return res.send(newFeedback)
}

const router = Router()

router.get('/:id', getFeedbacks, adminAccess)
router.post('/:id', submitFeedback)

module.exports = router
