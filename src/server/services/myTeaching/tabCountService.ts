import _ from 'lodash'
import { differenceInMonths, getYear } from 'date-fns'

import { Op } from 'sequelize'
import { UserFeedbackTarget, FeedbackTarget, CourseUnit, Summary, CourseRealisation, User } from '../../models'

import { type DateRangeInput, formatActivityPeriod } from '../../util/common'

const getTeacherCourseUnits = async (user: User, query: DateRangeInput) => {
  const activityPeriod = formatActivityPeriod(query)

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
          'feedbackResponse',
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
            attributes: ['data'],
          },
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            attributes: ['id', 'name', 'startDate', 'endDate', 'userCreated'],
            where: {
              ...(activityPeriod?.startDate &&
                activityPeriod?.endDate && {
                  [Op.or]: [
                    {
                      startDate: {
                        [Op.between]: [activityPeriod.startDate, activityPeriod.endDate],
                      },
                    },
                    {
                      endDate: {
                        [Op.between]: [activityPeriod.startDate, activityPeriod.endDate],
                      },
                    },
                    {
                      startDate: {
                        [Op.lte]: activityPeriod.startDate,
                      },
                      endDate: {
                        [Op.gte]: activityPeriod.endDate,
                      },
                    },
                  ],
                }),
            },
          },
        ],
      },
    ],
  })

  return teacherCourseUnits
}

const getEndedFeedbacksWithMissingResponse = async (courseUnits: CourseUnit[]) => {
  const latestEndedFeedbackTargets = courseUnits.map(courseUnit => {
    const { feedbackTargets } = courseUnit
    const endedFeedbackTargets = feedbackTargets.filter(({ closesAt }) => {
      if (!closesAt) return true

      const now = new Date()

      if (getYear(closesAt) === 2019) return false

      return now > new Date(closesAt)
    })

    const latestEndedFeedbackTarget = _.maxBy(endedFeedbackTargets, 'closesAt')

    if (!latestEndedFeedbackTarget) {
      return null
    }

    const { closesAt } = latestEndedFeedbackTarget.toJSON()
    const feedbackResponseGiven = latestEndedFeedbackTarget.feedbackResponseGiven()
    const isOld = differenceInMonths(new Date(), closesAt) > 12
    const feedbackCount = latestEndedFeedbackTarget.summary?.data?.feedbackCount || 0

    if (isOld || feedbackResponseGiven || feedbackCount === 0) {
      return null
    }

    return latestEndedFeedbackTarget
  })

  return latestEndedFeedbackTargets.filter(Boolean)
}

export const getMyTeachingTabCounts = async (user: User, query: DateRangeInput) => {
  const teacherCourseUnits = await getTeacherCourseUnits(user, query)

  const endedFeedbacksWithMissingResponse = await getEndedFeedbacksWithMissingResponse(teacherCourseUnits)

  const tabCounts = {
    ended: endedFeedbacksWithMissingResponse.length,
  }

  return tabCounts
}
