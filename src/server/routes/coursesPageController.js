const { FeedbackTarget } = require('../models')

const redirectFromCoursesPage = async (req, res) => {
  const courseId = req.params.id

  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: courseId,
      type: 'courseRealisation',
      hidden: false,
    },
  })

  if (!feedbackTarget) {
    return res.send(404)
  }

  return res.redirect(301, `/targets/${feedbackTarget.id}/feedback`)
}

module.exports = {
  redirectFromCoursesPage,
}
