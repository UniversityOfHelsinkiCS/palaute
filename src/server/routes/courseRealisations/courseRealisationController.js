const { Router } = require('express')
const { FeedbackTarget, UserFeedbackTarget } = require('../../models')

const getFeedbackTargetsByCourseRealisation = async (req, res) => {
  const { user, isAdmin } = req
  const { id } = req.params

  if (isAdmin) {
    const feedbackTargets = await FeedbackTarget.findAll({
      where: {
        courseRealisationId: id,
      },
    })

    return res.send(feedbackTargets)
  }

  const userTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        where: {
          courseRealisationId: id,
        },
      },
    ],
  })

  const targets = userTargets.map(({ feedbackTarget }) => feedbackTarget)

  return res.send(targets)
}

const router = Router()

router.get('/:id/feedback-targets', getFeedbackTargetsByCourseRealisation)

module.exports = router
