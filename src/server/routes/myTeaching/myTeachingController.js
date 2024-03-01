const { Router } = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Summary,
} = require('../../models')

const { sequelize } = require('../../db/dbConnection')

const getCourseUnitsForTeacher = async (req, res) => {
  const { query, user } = req

  const isOrganisationSurvey = query.isOrganisationSurvey === 'true'

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
              [Op.or]: [
                query.status === 'active' && {
                  startDate: { [Op.lte]: new Date() },
                  endDate: { [Op.gte]: new Date() },
                },
                query.status === 'upcoming' && {
                  startDate: { [Op.gt]: new Date() },
                },
                query.status === 'ended' && {
                  endDate: { [Op.lt]: new Date() },
                },
              ],
            },
          },
        ],
      },
    ],
  })

  const acualCUs = teacherCourseUnits.map(courseUnit => {
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

    return {
      id: courseUnit.dataValues.id,
      name: courseUnit.dataValues.name,
      courseCode: courseUnit.dataValues.courseCode,
      userCreated: courseUnit.dataValues.userCreated,
      disabledCourse,
      courseRealisations,
    }
  })

  const filteredCUs = acualCUs.filter(courseUnit => courseUnit.courseRealisations.length > 0)

  const groupedCUs = _.groupBy(filteredCUs, 'courseCode')

  const resultCourseUnits = Object.values(groupedCUs).map(courseUnits => {
    const sortedCUs = _.orderBy(courseUnits, courseUnit => courseUnit.validityPeriod?.startDate, 'desc')
    const courseRealisations = sortedCUs.flatMap(courseUnit => courseUnit.courseRealisations)
    const sortedCourseRealisations = _.orderBy(courseRealisations, 'startDate', 'desc')

    return {
      ...courseUnits[0],
      courseRealisations: sortedCourseRealisations,
    }
  })

  res.send(resultCourseUnits)
}

const router = Router()

router.get('/courses', getCourseUnitsForTeacher)

module.exports = router
