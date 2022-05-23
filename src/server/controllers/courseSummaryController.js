const { Op, QueryTypes } = require('sequelize')
const _ = require('lodash')
const { addYears } = require('date-fns')

const { CourseUnit, Survey, Organisation } = require('../models')

const {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
  getSummaryByOrganisation,
} = require('../util/courseSummary')

const {
  getOpenFeedbackByOrganisation,
} = require('../util/organisationOpenFeedback')

const { ApplicationError } = require('../util/customErrors')
const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')

const WORKLOAD_QUESTION_ID = 1042

const INCLUDED_ORGANISATIONS_BY_USER_ID = {
  // Jussi Merenmies
  'hy-hlo-1548120': ['300-M001'],
}

const filterOrganisationAccess = (organisationAccess, user) => {
  const includedOrganisationCodes = INCLUDED_ORGANISATIONS_BY_USER_ID[user.id]

  if (!includedOrganisationCodes) {
    return organisationAccess
  }

  return organisationAccess.filter(({ organisation }) =>
    includedOrganisationCodes.includes(organisation.code),
  )
}

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
    AND course_realisations.start_date > NOW() - interval '12 months';
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

  const adminAccess = !!organisationAccess.find((org) => org.access.admin)

  const accessible =
    organisationAccess.length > 0 || accessibleCourseRealisationIds.length > 0

  // For grafana statistics
  if (organisationAccess.length === 1) {
    const { name, code } = organisationAccess[0].organisation.dataValues
    logger.info('Organisation access', {
      organisationName: name.fi,
      organisationCode: code,
    })
  }

  res.send({
    accessible,
    adminAccess,
  })
}

const getByOrganisations = async (req, res) => {
  const { user } = req
  const { includeOpenUniCourseUnits, startDate, endDate } = req.query

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

  const parsedStartDate = startDate ? Date.parse(startDate) : null
  const defaultEndDate = parsedStartDate ? addYears(parsedStartDate, 1) : null
  const parsedEndDate = endDate ? Date.parse(endDate) : defaultEndDate

  const organisations = await getOrganisationSummaries({
    questions,
    organisationAccess: filterOrganisationAccess(organisationAccess, user),
    accessibleCourseRealisationIds,
    includeOpenUniCourseUnits: includeOpenUniCourseUnits !== 'false',
    startDate: parsedStartDate,
    endDate: parsedEndDate,
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

  const hasSomeCourseRealisationAccess = (
    await sequelize.query(
      `
    SELECT COUNT(*) > 0 as "hasAccess"
    FROM
      user_feedback_targets, feedback_targets
    WHERE
      feedback_targets.course_unit_id = :courseUnitId
      AND user_feedback_targets.feedback_target_id = feedback_targets.id
      AND user_feedback_targets.access_status = 'TEACHER';    
  `,
      {
        type: QueryTypes.SELECT,
        replacements: { courseUnitId: courseUnit.id },
      },
    )
  )[0]?.hasAccess

  if (!hasCourseUnitAccess && !hasSomeCourseRealisationAccess) {
    throw new ApplicationError('Forbidden', 403)
  }

  res.send({
    questions,
    courseRealisations,
    courseUnit,
  })
}

const getByOrganisation = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const { code } = req.params
  const { includeOpenUniCourseUnits } = req.query

  const access = organisationAccess.find(
    (org) => org.organisation.code === code,
  )

  if (!access) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { organisations, questions } = await getSummaryByOrganisation({
    organisationCode: code,
    includeOpenUniCourseUnits: includeOpenUniCourseUnits !== 'false',
  })

  res.send({
    organisations,
    summaryQuestions: questions,
  })
}

const getOpenQuestionsByOrganisation = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const { code } = req.params

  const access = organisationAccess.filter(
    (org) => org.organisation.code === code,
  )

  if (access.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const codesWithIds = await getOpenFeedbackByOrganisation(code)

  res.send(codesWithIds)
}

module.exports = {
  getByOrganisation,
  getByOrganisations,
  getByCourseUnit,
  getAccessInfo,
  getOpenQuestionsByOrganisation,
}
