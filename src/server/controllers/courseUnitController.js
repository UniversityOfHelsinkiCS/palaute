const { Op } = require('sequelize')
const _ = require('lodash')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
} = require('../models')

const { sequelize } = require('../util/dbConnection')

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
      user_feedback_targets.access_status = 'TEACHER' AND
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
      accessStatus: 'TEACHER',
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
          [
            sequelize.literal(`
          CASE
            WHEN "feedbackTarget".feedback_response IS NOT NULL
            AND char_length("feedbackTarget".feedback_response) > 0 THEN TRUE
            ELSE FALSE
          END
          `),
            'feedbackResponseGiven',
          ],
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

  const targetFields = ['id', 'name', 'opensAt', 'closesAt']

  const courseUnits = Object.entries(targetsByCourseCode).map(
    ([courseCode, targets]) => {
      const courseUnit = _.pick(courseUnitByCourseCode[courseCode].toJSON(), [
        'courseCode',
        'name',
      ])

      const ongoingTarget = _.maxBy(
        targets.filter(
          ({ courseRealisation }) =>
            courseRealisation.startDate <= new Date() &&
            courseRealisation.endDate >= new Date(),
        ),
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

      const ongoingCourseRealisation = ongoingTarget
        ? {
            ...ongoingTarget.courseRealisation.toJSON(),
            feedbackResponseGiven: ongoingTarget.get('feedbackResponseGiven'),
            feedbackTarget: _.pick(ongoingTarget, targetFields),
          }
        : null

      const upcomingCourseRealisation = upcomingTarget
        ? {
            ...upcomingTarget.courseRealisation.toJSON(),
            feedbackResponseGiven: upcomingTarget.get('feedbackResponseGiven'),
            feedbackTarget: _.pick(upcomingTarget, targetFields),
          }
        : null

      const endedCourseRealisation = endedTarget
        ? {
            ...endedTarget.courseRealisation.toJSON(),
            feedbackResponseGiven: endedTarget.get('feedbackResponseGiven'),
            feedbackTarget: _.pick(endedTarget, targetFields),
          }
        : null

      return {
        ...courseUnit,
        ongoingCourseRealisation,
        upcomingCourseRealisation,
        endedCourseRealisation,
      }
    },
  )

  res.send(courseUnits)
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

  const courseUnits = courseUnitRows.map((row) => ({
    name: row.course_unit_name,
    id: row.course_unit_id,
    courseCode: row.course_code,
  }))

  res.send(courseUnits)
}

module.exports = {
  getCourseUnitsForTeacher,
  getCourseUnitsByOrganisation,
}
