/**
 * User preferences for the application,
 * mainly used for summary page UI
 *
 * These are computed automatically based on user access rights & teacher associations etc...
 */

const { FeedbackTarget, UserFeedbackTarget, Summary } = require('../../models')
const { startOfStudyYear, endOfStudyYear } = require('../../util/common')

/**
 * Get user's preferred summary view type, either "organisation" or "teacher"
 * Depending on whether the user has courses with feedback in the current semester
 * and whether they have organisation access.
 */
const getPreferredSummaryView = async user => {
  const { organisationAccess } = user
  const hasOrganisationAccess = Object.values(organisationAccess).some(access => access.read)

  // Check if user has courses with feedback in the current semester
  const startDate = startOfStudyYear(new Date())
  const endDate = endOfStudyYear(new Date())

  const count = await FeedbackTarget.count({
    include: [
      {
        model: UserFeedbackTarget.scope('teachers'),
        where: {
          userId: user.id,
        },
        as: 'userFeedbackTargets',
        required: true,
      },
      {
        model: Summary.scope({ method: ['at', startDate, endDate] }),
        as: 'summary',
        required: true,
      },
    ],
  })

  if (count > 0) {
    return 'teacher'
  }
  if (hasOrganisationAccess) {
    return 'organisation'
  }

  return 'organisation'
}

const getUserPreferences = async user => ({
  summaryView: await getPreferredSummaryView(user),
})

module.exports = {
  getUserPreferences,
}
