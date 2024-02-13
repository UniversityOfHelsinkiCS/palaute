const { Router } = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit, Organisation } = require('../../models')

const { sequelize } = require('../../db/dbConnection')

const getCourseUnitsForTeacher = async (req, res) => {
  const { params, user } = req

  const courseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode', 'userCreated', 'validityPeriod'],
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
          'feedbackCount',
          'continuousFeedbackEnabled',
          'userCreated',
          'courseRealisationId',
        ],
        where: {
          feedbackType: 'courseRealisation',
        },
        include: [
          {
            model: UserFeedbackTarget,
            as: 'userFeedbackTargets',
            required: true,
            where: {
              userId: user.id,
              accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
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

  const acualCUs = courseUnits.map(courseUnit => {
    const courseRealisations = courseUnit.feedbackTargets.map(feedbackTarget => feedbackTarget.courseRealisation)

    const feedbackTargets = _.groupBy(courseUnit.feedbackTargets, 'courseRealisationId')

    const disabledCourse = courseUnit.organisations.some(org => org.disabledCourseCodes.includes(courseUnit.courseCode))

    return {
      id: courseUnit.dataValues.id,
      name: courseUnit.dataValues.name,
      courseCode: courseUnit.dataValues.courseCode,
      userCreated: courseUnit.dataValues.userCreated,
      disabledCourse,
      courseRealisations: courseRealisations.map(courseRealisation => {
        const acualCUR = courseRealisation.toJSON()
        const acualFBTs = feedbackTargets[courseRealisation.id].map(feedbackTarget => {
          const targetFields = [
            'id',
            'name',
            'opensAt',
            'closesAt',
            'feedbackResponseSent',
            'feedbackResponseGiven',
            'feedbackCount',
            'continuousFeedbackEnabled',
            'userCreated',
          ]

          return _.pick(feedbackTarget.toJSON(), targetFields)
        })

        const [interimFbts, fbts] = _.partition(acualFBTs, 'userCreated')

        acualCUR.feedbackTargets = fbts
        acualCUR.interimFeedbackTargets = interimFbts

        return acualCUR
      }),
    }
  })

  const groupedCourseUnits = _.groupBy(acualCUs, 'courseCode')

  const teacherCourseUnits = Object.values(groupedCourseUnits).map(courseUnits => {
    const sortedCourseUnit = _.orderBy(courseUnits, courseUnit => courseUnit.validityPeriod?.startDate, 'desc')

    return {
      ...courseUnits[0],
      courseRealisations: sortedCourseUnit.flatMap(courseUnit => courseUnit.courseRealisations),
    }
  })

  res.send(teacherCourseUnits)
}

const router = Router()

router.get('/courses', getCourseUnitsForTeacher)

module.exports = router
