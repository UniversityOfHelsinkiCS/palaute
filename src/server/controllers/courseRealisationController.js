const { FeedbackTarget, UserFeedbackTarget } = require('../models')

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

const feedbackTargetByCourseRealisation = async (req, res) => {
  const courseId = req.params.id

  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: courseId,
      type: 'courseRealisation',
      hidden: false,
    },
  })

  if (!feedbackTarget) {
    res.send(404)
  }

  res.redirect(301, `/targets/${feedbackTarget.id}/feedback`)
}

module.exports = {
  getFeedbackTargetsByCourseRealisation,
  feedbackTargetByCourseRealisation,
}
