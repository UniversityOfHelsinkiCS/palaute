const { Router } = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Tag,
  Summary,
} = require('../../models')

const { sequelize } = require('../../db/dbConnection')
const { INCLUDE_COURSES } = require('../../util/config')

const getCourseUnitsForTeacher = async (req, res) => {
  const { user } = req

  const now = new Date()

  const latestEndedCourseRealisationsRows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_units.course_code)
      course_realisations.id AS course_realisation_id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
    INNER JOIN course_units_organisations ON course_units_organisations.course_unit_id = course_units.id
    INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
    WHERE
      user_feedback_targets.user_id = :userId AND
      is_teacher(user_feedback_targets.access_status) AND
      course_realisations.end_date < NOW() AND
      course_realisations.end_date > :courseRealisationEndDateAfter AND
      course_units_organisations.type = 'PRIMARY' AND
      NOT (course_units.course_code = ANY (organisations.disabled_course_codes))
    ORDER BY course_units.course_code, course_realisations.start_date DESC;
  `,
    {
      replacements: {
        userId: user.id,
        courseRealisationEndDateAfter: new Date(2021, 3, 1),
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  const latestEndedCourseRealisationIds = latestEndedCourseRealisationsRows.map(row => row.course_realisation_id)

  const userTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
      accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
    },
    attributes: ['id'],
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
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
        ],
        where: {
          feedbackType: 'courseRealisation',
        },
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            attributes: ['id', 'name', 'startDate', 'endDate', 'userCreated'],
            where: {
              [Op.or]: [
                {
                  startDate: {
                    [Op.lte]: now,
                  },
                  endDate: {
                    [Op.gte]: now,
                  },
                },
                {
                  startDate: {
                    [Op.gt]: now,
                  },
                },
                {
                  id: {
                    [Op.in]: latestEndedCourseRealisationIds,
                  },
                },
              ],
            },
          },
          {
            model: Summary,
            required: false,
            as: 'summary',
          },
          {
            model: CourseUnit,
            as: 'courseUnit',
            required: true,
            attributes: ['id', 'name', 'courseCode', 'userCreated'],
            include: [
              {
                model: Organisation,
                as: 'organisations',
                required: true,
                attributes: ['disabledCourseCodes'],
              },
            ],
          },
        ],
      },
    ],
  })

  const targets = userTargets
    .filter(({ feedbackTarget }) => (feedbackTarget.userCreated ? feedbackTarget.courseRealisation.userCreated : true))
    .map(({ feedbackTarget }) => feedbackTarget)
    .filter(
      ({ courseUnit }) =>
        !courseUnit.organisations.some(({ disabledCourseCodes }) => disabledCourseCodes.includes(courseUnit.courseCode))
    )

  const courseUnitByCourseCode = targets.reduce(
    (acc, { courseUnit }) => ({
      ...acc,
      [courseUnit.courseCode]: courseUnit,
    }),
    {}
  )

  const targetsByCourseCode = _.groupBy(targets, ({ courseUnit }) => courseUnit.courseCode)

  const targetFields = ['id', 'name', 'opensAt', 'closesAt', 'continuousFeedbackEnabled', 'userCreated']
  const courseUnits = Object.entries(targetsByCourseCode).map(([courseCode, unfilteredTargets]) => {
    const targets = unfilteredTargets.filter(
      target =>
        target.courseRealisation.startDate >= new Date(2021, 8, 1) ||
        (target.courseRealisation.startDate >= new Date(2021, 7, 15) &&
          target.courseRealisation.endDate >= new Date(2021, 9, 1)) ||
        INCLUDE_COURSES.includes(target.courseRealisation.id)
    )
    const courseUnit = _.pick(courseUnitByCourseCode[courseCode].toJSON(), ['courseCode', 'name', 'userCreated'])

    const ongoingTargets = targets.filter(
      ({ courseRealisation }) => courseRealisation.startDate <= new Date() && courseRealisation.endDate >= new Date()
    )

    const feedbackOpenOngoingTarget = ongoingTargets.find(target => target.isOpen())

    const ongoingTarget =
      feedbackOpenOngoingTarget ?? _.maxBy(ongoingTargets, ({ courseRealisation }) => courseRealisation.startDate)

    const upcomingTarget = _.minBy(
      targets.filter(({ courseRealisation }) => courseRealisation.startDate > new Date()),
      ({ courseRealisation }) => courseRealisation.startDate
    )

    const endedTarget = _.maxBy(
      targets.filter(({ courseRealisation }) => courseRealisation.endDate < new Date()),
      ({ courseRealisation }) => courseRealisation.startDate
    )

    const makeTargetObject = feedbackTarget =>
      feedbackTarget
        ? {
            ...feedbackTarget.courseRealisation.toJSON(),
            feedbackResponseGiven: feedbackTarget.dataValues.feedbackResponseGiven,
            feedbackResponseSent: feedbackTarget.dataValues.feedbackResponseSent,
            feedbackCount: feedbackTarget.summary?.feedbackCount ?? 0,
            studentCount: feedbackTarget.summary?.studentCount ?? 0,
            feedbackTarget: _.pick(feedbackTarget, targetFields),
          }
        : null

    return {
      ...courseUnit,
      ongoingCourseRealisation: makeTargetObject(ongoingTarget),
      upcomingCourseRealisation: makeTargetObject(upcomingTarget),
      endedCourseRealisation: makeTargetObject(endedTarget),
    }
  })

  return res.send(courseUnits)
}

const getCourseUnitsByOrganisation = async (req, res) => {
  const { code } = req.params

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode: {
        [Op.notLike]: 'AY%',
      },
      '$organisations.CourseUnitsOrganisation.type$': 'PRIMARY',
    },
    include: [
      {
        model: Organisation,
        attributes: [],
        required: true,
        as: 'organisations',
        where: {
          code,
        },
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'hash'],
        through: { attributes: [] },
      },
    ],
  })

  // First sort by validity period start date. This ensures that when taking the uniq, the most recent CUs are preserved
  const uniqueCourseUnits = _.uniqBy(
    _.orderBy(courseUnits, cu => Date.parse(cu.validityPeriod?.startDate), 'desc'),
    'courseCode'
  )

  const sortedCourseUnits = _.sortBy(uniqueCourseUnits, 'courseCode')

  return res.send(sortedCourseUnits)
}

const router = Router()

router.get('/responsible', getCourseUnitsForTeacher)
router.get('/for-organisation/:code', getCourseUnitsByOrganisation)

module.exports = router
