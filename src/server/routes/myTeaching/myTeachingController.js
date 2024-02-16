const { Router } = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit, Organisation } = require('../../models')

const { sequelize } = require('../../db/dbConnection')

const getCourseUnitsForTeacher = async (req, res) => {
  const { query, user } = req

  const onlyOrganisationSurveys = query.onlyOrganisationSurveys === 'true'

  const teacherCourseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode', 'userCreated', 'validityPeriod'],
    where: {
      userCreated: onlyOrganisationSurveys,
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

  const acualCUs = teacherCourseUnits.map(courseUnit => {
    const courseRealisations = courseUnit.feedbackTargets.map(feedbackTarget => feedbackTarget.courseRealisation)

    const filteredCURs = courseRealisations.filter(courseRealisation => {
      const now = new Date()

      if (query.status === 'ongoing') {
        return courseRealisation.startDate <= now && courseRealisation.endDate >= now
      }
      if (query.status === 'upcoming') {
        return courseRealisation.startDate > now
      }
      if (query.status === 'ended') {
        return courseRealisation.endDate < now
      }

      return null
    })

    const feedbackTargets = _.groupBy(courseUnit.feedbackTargets, 'courseRealisationId')

    const disabledCourse = courseUnit.organisations.some(org => org.disabledCourseCodes.includes(courseUnit.courseCode))

    return {
      id: courseUnit.dataValues.id,
      name: courseUnit.dataValues.name,
      courseCode: courseUnit.dataValues.courseCode,
      userCreated: courseUnit.dataValues.userCreated,
      disabledCourse,
      courseRealisations: filteredCURs.map(courseRealisation => {
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

  const filteredCUs = acualCUs.filter(courseUnit => courseUnit.courseRealisations.length > 0)

  const groupedCUs = _.groupBy(filteredCUs, 'courseCode')

  const resultCourseUnits = Object.values(groupedCUs).map(courseUnits => {
    const sortedCUs = _.orderBy(courseUnits, courseUnit => courseUnit.validityPeriod?.startDate, 'desc')

    return {
      ...courseUnits[0],
      courseRealisations: sortedCUs.flatMap(courseUnit => courseUnit.courseRealisations),
    }
  })

  res.send(resultCourseUnits)
}

const router = Router()

router.get('/courses', getCourseUnitsForTeacher)

module.exports = router
