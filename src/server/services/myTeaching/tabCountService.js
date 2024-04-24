const _ = require('lodash')
const { differenceInMonths, parseISO, getYear } = require('date-fns')

const { UserFeedbackTarget, FeedbackTarget, CourseUnit, Summary } = require('../../models')

const { sequelize } = require('../../db/dbConnection')

const getTeacherCourseUnits = async user => {
  const teacherCourseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode'],
    where: {
      userCreated: false,
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        required: true,
        attributes: [
          'id',
          'opensAt',
          'closesAt',
          ['feedback_response_email_sent', 'feedbackResponseSent'],
          [sequelize.literal(`length(feedback_response) > 3`), 'feedbackResponseGiven'],
        ],
        include: [
          {
            model: UserFeedbackTarget.scope('teachers'),
            as: 'userFeedbackTargets',
            required: true,
            attributes: ['id'],
            where: {
              userId: user.id,
            },
          },
          {
            model: Summary,
            as: 'summary',
            required: false,
          },
        ],
      },
    ],
  })

  return teacherCourseUnits
}

const getEndedFeedbacksWithMissingResponse = async courseUnits => {
  const latestEndedFeedbackTargets = courseUnits.map(courseUnit => {
    const { feedbackTargets } = courseUnit
    const endedFeedbackTargets = feedbackTargets.filter(({ closesAt }) => {
      if (!closesAt) return true

      const now = new Date()

      if (getYear(parseISO(closesAt)) === 2019) return false

      return now > new Date(closesAt)
    })

    const latestEndedFeedbackTarget = _.maxBy(endedFeedbackTargets, 'closesAt')

    if (!latestEndedFeedbackTarget) {
      return null
    }

    const { feedbackResponseGiven, closesAt } = latestEndedFeedbackTarget.toJSON()
    const isOld = differenceInMonths(new Date(), closesAt) > 12
    const feedbackCount = latestEndedFeedbackTarget.summary?.data?.feedbackCount || 0

    if (isOld || feedbackResponseGiven || feedbackCount === 0) {
      return null
    }

    return latestEndedFeedbackTarget
  })

  return latestEndedFeedbackTargets.filter(Boolean)
}

const getMyTeachingTabCounts = async user => {
  const teacherCourseUnits = await getTeacherCourseUnits(user)

  const endedFeedbacksWithMissingResponse = await getEndedFeedbacksWithMissingResponse(teacherCourseUnits)

  const tabCounts = {
    ended: endedFeedbacksWithMissingResponse.length,
  }

  return tabCounts
}

module.exports = {
  getMyTeachingTabCounts,
}
