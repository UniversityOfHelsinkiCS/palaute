const { FeedbackTarget } = require('../../models')

/**
 * Currently only used for redirecting from hy course page, so only id and feedbackType are needed.
 * Update included attributes if usage changes.
 * Note that auth is done when user actually gets the redirected page
 */
const getForCourseRealisation = async ({ courseRealisationId }) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: ['id', 'feedbackType'],
    where: {
      courseRealisationId,
      feedbackType: 'courseRealisation',
    },
  })

  return feedbackTargets
}

module.exports = {
  getForCourseRealisation,
}
