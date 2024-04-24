const _ = require('lodash')
const { differenceInMonths, parseISO, getYear } = require('date-fns')

const { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit } = require('../../models')

const { sequelize } = require('../../db/dbConnection')

const getAllTeacherCourseUnits = async user => {
  const teacherCourseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode', 'userCreated', 'validityPeriod'],
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
          'name',
          'opensAt',
          'closesAt',
          ['feedback_response_email_sent', 'feedbackResponseSent'],
          [sequelize.literal(`length(feedback_response) > 3`), 'feedbackResponseGiven'],
          'continuousFeedbackEnabled',
          'userCreated',
          'courseRealisationId',
        ],
        where: {
          feedbackType: 'courseRealisation',
        },
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
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            attributes: ['id', 'name', 'startDate', 'endDate', 'userCreated'],
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

    if (isOld || feedbackResponseGiven) {
      return null
    }

    return latestEndedFeedbackTarget
  })

  return latestEndedFeedbackTargets
}

const getMyTeachingTabCounts = async user => {
  const teacherCourseUnits = await getAllTeacherCourseUnits(user)

  const endedFeedbacksWithMissingResponse = await getEndedFeedbacksWithMissingResponse(teacherCourseUnits)

  const tabCounts = {
    ended: 0,
  }

  return endedFeedbacksWithMissingResponse
}

module.exports = {
  getMyTeachingTabCounts,
}
