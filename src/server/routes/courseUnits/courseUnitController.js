const { Router } = require('express')
const { Op } = require('sequelize')
const _ = require('lodash')
const { INCLUDE_COURSES } = require('../../../config')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
} = require('../../models')

const { sequelize } = require('../../util/dbConnection')

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
      (user_feedback_targets.access_status = 'RESPONSIBLE_TEACHER' OR user_feedback_targets.access_status = 'TEACHER') AND
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
    },
  )

  const latestEndedCourseRealisationIds = latestEndedCourseRealisationsRows.map(
    (row) => row.course_realisation_id,
  )

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
          [
            sequelize.literal(`length(feedback_response) > 3`),
            'feedbackResponseGiven',
          ],
          'feedbackCount',
          'continuousFeedbackEnabled',
        ],
        where: {
          feedbackType: 'courseRealisation',
        },
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            attributes: ['id', 'name', 'startDate', 'endDate'],
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
            model: CourseUnit,
            as: 'courseUnit',
            required: true,
            attributes: ['id', 'name', 'courseCode'],
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
    .map(({ feedbackTarget }) => feedbackTarget)
    .filter(
      ({ courseUnit }) =>
        !courseUnit.organisations.some(({ disabledCourseCodes }) =>
          disabledCourseCodes.includes(courseUnit.courseCode),
        ),
    )

  const courseUnitByCourseCode = targets.reduce(
    (acc, { courseUnit }) => ({
      ...acc,
      [courseUnit.courseCode]: courseUnit,
    }),
    {},
  )

  const targetsByCourseCode = _.groupBy(
    targets,
    ({ courseUnit }) => courseUnit.courseCode,
  )

  const targetFields = [
    'id',
    'name',
    'opensAt',
    'closesAt',
    'continuousFeedbackEnabled',
  ]
  const courseUnits = Object.entries(targetsByCourseCode).map(
    ([courseCode, unfilteredTargets]) => {
      const targets = unfilteredTargets.filter(
        (target) =>
          target.courseRealisation.startDate >= new Date(2021, 8, 1) ||
          (target.courseRealisation.startDate >= new Date(2021, 7, 15) &&
            target.courseRealisation.endDate >= new Date(2021, 9, 1)) ||
          INCLUDE_COURSES.has(target.courseRealisation.id),
      )

      const courseUnit = _.pick(courseUnitByCourseCode[courseCode].toJSON(), [
        'courseCode',
        'name',
      ])

      const ongoingTargets = targets.filter(
        ({ courseRealisation }) =>
          courseRealisation.startDate <= new Date() &&
          courseRealisation.endDate >= new Date(),
      )

      const feedbackOpenOngoingTarget = ongoingTargets.find((target) =>
        target.isOpen(),
      )

      const ongoingTarget =
        feedbackOpenOngoingTarget ??
        _.maxBy(
          ongoingTargets,
          ({ courseRealisation }) => courseRealisation.startDate,
        )

      const upcomingTarget = _.minBy(
        targets.filter(
          ({ courseRealisation }) => courseRealisation.startDate > new Date(),
        ),
        ({ courseRealisation }) => courseRealisation.startDate,
      )

      const endedTarget = _.maxBy(
        targets.filter(
          ({ courseRealisation }) => courseRealisation.endDate < new Date(),
        ),
        ({ courseRealisation }) => courseRealisation.startDate,
      )

      const makeTargetObject = (feedbackTarget) =>
        feedbackTarget
          ? {
              ...feedbackTarget.courseRealisation.toJSON(),
              feedbackResponseGiven:
                feedbackTarget.dataValues.feedbackResponseGiven,
              feedbackResponseSent:
                feedbackTarget.dataValues.feedbackResponseSent,
              feedbackCount: Number(feedbackTarget.dataValues.feedbackCount),
              feedbackTarget: _.pick(feedbackTarget, targetFields),
            }
          : null

      return {
        ...courseUnit,
        ongoingCourseRealisation: makeTargetObject(ongoingTarget),
        upcomingCourseRealisation: makeTargetObject(upcomingTarget),
        endedCourseRealisation: makeTargetObject(endedTarget),
      }
    },
  )

  return res.send(courseUnits)
}

const getCourseUnitsByOrganisation = async (req, res) => {
  const { code } = req.params

  const courseUnitRows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_units.course_code)
      course_units.id AS course_unit_id,
      course_units.course_code AS course_code,
      course_units.name AS course_unit_name
    FROM course_units
    INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
    INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
    WHERE
      organisations.code = :organisationCode AND course_units_organisations.type = 'PRIMARY'
    ORDER BY course_units.course_code, course_units.validity_period->>'startDate' DESC NULLS LAST;
  `,
    {
      replacements: {
        organisationCode: code,
      },
      type: sequelize.QueryTypes.SELECT,
    },
  )

  const courseUnits = courseUnitRows
    .filter((row) => !row.course_code.startsWith('AY'))
    .map((row) => ({
      name: row.course_unit_name,
      id: row.course_unit_id,
      courseCode: row.course_code,
    }))

  return res.send(courseUnits)
}

const router = Router()

router.get('/responsible', getCourseUnitsForTeacher)
router.get('/for-organisation/:code', getCourseUnitsByOrganisation)

module.exports = router
