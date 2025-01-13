const _ = require('lodash')
const { Op } = require('sequelize')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Summary,
} = require('../../models')

const { sequelize } = require('../../db/dbConnection')
const { formatActivityPeriod } = require('../../util/common')

const getAllTeacherCourseUnits = async (user, query) => {
  const isOrganisationSurvey = query.isOrganisationSurvey === 'true'

  const activityPeriod = formatActivityPeriod(query)

  const teacherCourseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode', 'userCreated', 'validityPeriod'],
    where: {
      userCreated: isOrganisationSurvey,
    },
    include: [
      {
        model: Organisation,
        as: 'organisations',
        required: true,
        attributes: ['disabledCourseCodes'],
      },
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
            model: UserFeedbackTarget.scope('students'),
            as: 'students',
            required: false,
            separate: true,
            attributes: ['id'],
          },
          {
            model: Summary,
            as: 'summary',
            required: false,
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

const getGroupedCourseUnits = (courseUnits, query) => {
  const acualCUs = courseUnits.map(courseUnit => {
    const initialCourseRealisations = courseUnit.feedbackTargets.map(feedbackTarget => feedbackTarget.courseRealisation)

    // Interim feedbacks cause duplicate course realisations in the above array
    const uniqueCourseRealisations = _.uniqBy(initialCourseRealisations, 'id')

    const feedbackTargets = _.groupBy(courseUnit.feedbackTargets, 'courseRealisationId')

    // Course is not enabled for feedback in the organisation settings
    const disabledCourse = courseUnit.organisations.some(org => org.disabledCourseCodes.includes(courseUnit.courseCode))

    const courseRealisations = uniqueCourseRealisations.map(courseRealisation => {
      const acualFBTs = feedbackTargets[courseRealisation.id].map(target => {
        const targetFields = [
          'id',
          'name',
          'opensAt',
          'closesAt',
          'feedbackResponseSent',
          'feedbackResponseGiven',
          'continuousFeedbackEnabled',
          'userCreated',
          'feedbackCount',
          'studentCount',
        ]

        // Summary data is not available for organisation surveys, which is why
        // we need to fetch the student count and feedback count from the feedback target
        const feedbackTarget = {
          ...target.toJSON(),
          studentCount: target.summary?.data?.studentCount || 0,
          feedbackCount: target.summary?.data?.feedbackCount || 0,
        }

        return _.pick(feedbackTarget, targetFields)
      })

      const [interimFbts, fbts] = _.partition(acualFBTs, fbt => fbt.userCreated && !courseRealisation.userCreated)

      const acualCUR = {
        ...courseRealisation.toJSON(),
        feedbackTargets: fbts,
        interimFeedbackTargets: interimFbts,
      }

      return acualCUR
    })

    const groupedCourseRealisations = courseRealisations.filter(courseRealisation => {
      const now = new Date()

      if (query.status === 'active') {
        const activeCourseRealisation = courseRealisation.startDate <= now && courseRealisation.endDate >= now
        const activeFeedbackTargets = courseRealisation.feedbackTargets.some(
          fbt => fbt.opensAt <= now && fbt.closesAt >= now
        )

        return activeCourseRealisation || activeFeedbackTargets
      }
      if (query.status === 'upcoming') {
        return courseRealisation.startDate > now
      }
      if (query.status === 'ended') {
        const endedCourseRealisation = courseRealisation.endDate < now
        const activeFeedbackTargets = courseRealisation.feedbackTargets.some(
          fbt => fbt.opensAt <= now && fbt.closesAt >= now
        )

        return endedCourseRealisation && !activeFeedbackTargets
      }

      return null
    })

    return {
      id: courseUnit.dataValues.id,
      name: courseUnit.dataValues.name,
      courseCode: courseUnit.dataValues.courseCode,
      userCreated: courseUnit.dataValues.userCreated,
      disabledCourse,
      courseRealisations: groupedCourseRealisations,
    }
  })

  return acualCUs
}

const getTeacherCourseUnits = async (user, query) => {
  const teacherCourseUnits = await getAllTeacherCourseUnits(user, query)

  const groupedCourseUnits = getGroupedCourseUnits(teacherCourseUnits, query)

  const filteredCourseUnits = groupedCourseUnits.filter(courseUnit => courseUnit.courseRealisations.length > 0)

  const courseUnitsByCode = _.groupBy(filteredCourseUnits, 'courseCode')

  const resultCourseUnits = Object.values(courseUnitsByCode).map(courseUnits => {
    const sortedCUs = _.orderBy(courseUnits, courseUnit => courseUnit.validityPeriod?.startDate, 'desc')
    const courseRealisations = sortedCUs.flatMap(courseUnit => courseUnit.courseRealisations)
    const sortedCourseRealisations = _.orderBy(courseRealisations, 'startDate', 'desc')

    return {
      ...courseUnits[0],
      courseRealisations: sortedCourseRealisations,
    }
  })

  return resultCourseUnits
}

module.exports = {
  getTeacherCourseUnits,
}
