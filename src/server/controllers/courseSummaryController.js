const { Op } = require('sequelize')
const _ = require('lodash')

const { CourseUnit, Survey, Organisation } = require('../models')

const {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
} = require('../util/courseSummary')

const { ApplicationError } = require('../util/customErrors')
const { sequelize } = require('../util/dbConnection')

const WORKLOAD_QUESTION_ID = 1042

const getAccessibleCourseRealisationIds = async (user) => {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_realisations.id) course_realisations.id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    WHERE user_feedback_targets.user_id = :userId
    AND user_feedback_targets.access_status = 'TEACHER'
    AND feedback_targets.feedback_type = 'courseRealisation'
    AND course_realisations.start_date < NOW()
    AND course_realisations.start_date > NOW() - interval '48 months';
  `,
    {
      replacements: {
        userId: user.id,
      },
      type: sequelize.QueryTypes.SELECT,
    },
  )

  return rows.map((row) => row.id)
}

const getAccessibleCourseCodes = async (organisationAccess) => {
  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
    return []
  }

  const organisations = await Organisation.findAll({
    where: {
      id: {
        [Op.in]: organisationIds,
      },
    },
    include: [
      {
        model: CourseUnit,
        as: 'courseUnits',
        attributes: ['courseCode'],
        required: true,
      },
    ],
    attributes: ['id', 'disabledCourseCodes'],
  })

  const courseUnits = organisations.flatMap(({ courseUnits }) => courseUnits)

  const disabledCourseCodes = organisations.flatMap(
    ({ disabledCourseCodes }) => disabledCourseCodes,
  )

  const courseCodes = courseUnits.flatMap(({ courseCode }) =>
    disabledCourseCodes.includes(courseCode) ? [] : [courseCode],
  )

  return _.uniq(courseCodes)
}

const getSummaryQuestions = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const { questions = [] } = universitySurvey

  const summaryQuestions = questions.filter(
    (q) => q.type === 'LIKERT' || q.id === WORKLOAD_QUESTION_ID,
  )

  return summaryQuestions.map((question) => ({
    ...question.toJSON(),
    secondaryType: question.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : null,
  }))
}

const getAccessInfo = async (req, res) => {
  const { user } = req

  const [organisationAccess, accessibleCourseRealisationIds] =
    await Promise.all([
      user.getOrganisationAccess(),
      getAccessibleCourseRealisationIds(user),
    ])

  const accessible =
    organisationAccess.length > 0 || accessibleCourseRealisationIds.length > 0

  res.send({
    accessible,
  })
}

const getByOrganisations = async (req, res) => {
  const { user } = req

  const [organisationAccess, accessibleCourseRealisationIds, questions] =
    await Promise.all([
      user.getOrganisationAccess(),
      getAccessibleCourseRealisationIds(user),
      getSummaryQuestions(),
    ])

  if (
    organisationAccess.length === 0 &&
    accessibleCourseRealisationIds.length === 0
  ) {
    throw new ApplicationError('Forbidden', 403)
  }

  const organisations = await getOrganisationSummaries({
    questions,
    organisationAccess,
    accessibleCourseRealisationIds,
  })

  res.send({
    questions,
    organisations,
  })
}

const getByCourseUnit = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const { code } = req.params

  const [questions, accessibleCourseCodes, courseUnit] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
    CourseUnit.findOne({ where: { courseCode: code } }),
  ])

  if (!courseUnit) {
    throw new ApplicationError('Course unit is not found', 404)
  }

  const courseRealisations = await getCourseRealisationSummaries({
    courseCode: code,
    questions,
  })

  const hasCourseUnitAccess = accessibleCourseCodes.includes(
    courseRealisations[0]?.courseCode,
  )

  const hasSomeCourseRealisationAccess = courseRealisations.some(
    ({ teachers }) => Boolean(teachers.find((t) => t.id === user.id)),
  )

  if (!hasCourseUnitAccess && !hasSomeCourseRealisationAccess) {
    throw new ApplicationError(403, 'Forbidden')
  }

  const filteredCourseRealisations = hasCourseUnitAccess
    ? courseRealisations
    : courseRealisations.filter(({ teachers }) =>
        Boolean(teachers.find((t) => t.id === user.id)),
      )

  res.send({
    questions,
    courseRealisations: filteredCourseRealisations,
    courseUnit,
  })
}

module.exports = {
  getByOrganisations,
  getByCourseUnit,
  getAccessInfo,
}
