/**
 * User preferences for the application,
 * mainly used for summary page UI
 *
 * These are computed automatically based on user access rights & teacher associations etc...
 */

const _ = require('lodash')
const { FeedbackTarget, UserFeedbackTarget, Summary, CourseRealisation } = require('../../models')
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
    return 'my-courses'
  }
  if (hasOrganisationAccess) {
    return 'my-organisations'
  }

  return 'my-organisations'
}

/**
 * Get user's preferred tab.
 * If they have upcoming or currently running courses, show "courses" tab by default.
 * Otherwise if they have summary access, show "course-summary" tab by default.
 * Otherwise show "feedbacks" tab.
 */
const getPreferredTab = async (user, hasSummaryAccess) => {
  const fbts = await FeedbackTarget.findAll({
    attributes: [],
    include: [
      {
        model: UserFeedbackTarget.scope('teachers'),
        where: {
          userId: user.id,
        },
        required: true,
        as: 'userFeedbackTargets',
        attributes: [],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        attributes: ['startDate', 'endDate'],
      },
    ],
  })

  const now = new Date()

  const currentlyRunningAndUpcoming = _.sumBy(fbts, fbt =>
    fbt.courseRealisation.startDate > now ||
    (fbt.courseRealisation.startDate <= now && fbt.courseRealisation.endDate >= now)
      ? 1
      : 0
  )
  const hasCurrentlyRunningOrUpcoming = currentlyRunningAndUpcoming > 0

  if (hasCurrentlyRunningOrUpcoming) {
    return 'courses'
  }
  if (hasSummaryAccess) {
    return 'course-summary'
  }
  return 'feedbacks'
}

/**
 * Compute user preferences
 */
const getUserPreferences = async user => {
  const hasSummaryAccess = user.iamGroups.length > 0 || Boolean(user.employeeNumber)
  const preferredTab = await getPreferredTab(user, hasSummaryAccess)
  const summaryView = hasSummaryAccess ? await getPreferredSummaryView(user) : null

  return {
    hasSummaryAccess,
    summaryView,
    defaultView: preferredTab,
  }
}

module.exports = {
  getUserPreferences,
}
