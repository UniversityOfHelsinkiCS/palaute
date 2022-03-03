/* eslint-disable camelcase */
const _ = require('lodash')

const { Op } = require('sequelize')
const { sequelize } = require('../dbConnection')
const { Survey, FeedbackSummaryCache, Organisation } = require('../../models')

const {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
} = require('./utils')
const logger = require('../logger')

const OPEN_UNI_ORGANISATION_ID = 'hy-org-48645785'

const WORKLOAD_QUESTION_ID = 1042

const executeSummaryQuery = ({
  questionIds,
  organisationId,
  validDataValues,
}) => {
  const query = `
  WITH question_averages AS (
    ${QUESTION_AVERAGES_QUERY}
  ), feedback_counts AS (
    ${COUNTS_QUERY}
  )
  
  SELECT
    question_id,
    question_data,
    question_data_count,
    feedback_count,
    student_count,
    feedback_targets.id AS feedback_target_id,
    feedback_targets.closes_at AS closes_at,
    course_realisations.id AS course_realisation_id,
    course_realisations.name AS course_realisation_name,
    course_realisations.start_date AS course_realisation_start_date,
    course_realisations.end_date AS course_realisation_end_date,
    course_units.course_code AS course_code,
    course_units.name AS course_unit_name,
    course_units.id AS course_unit_id,
    organisation_access.organisation_id AS course_realisations_organisation_id,
    organisations.id AS organisation_id,
    organisations.name AS organisation_name,
    organisations.code AS organisation_code,
    CASE
      WHEN feedback_targets.feedback_response IS NOT NULL
      AND char_length(feedback_targets.feedback_response) > 0 THEN TRUE
      ELSE FALSE
    END AS feedback_response_given
  FROM question_averages
    INNER JOIN feedback_targets ON question_averages.feedback_target_id = feedback_targets.id
    INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
    INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
  
    INNER JOIN LATERAL (
      SELECT organisation_id FROM course_realisations_organisations WHERE course_realisation_id = course_realisations.id
      UNION
      SELECT organisation_id FROM course_units_organisations WHERE course_unit_id = course_units.id
    ) organisation_access ON TRUE
  
    INNER JOIN organisations ON organisation_access.organisation_id = organisations.id
    INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = feedback_targets.id
  WHERE
    feedback_targets.feedback_type = 'courseRealisation'
    AND course_realisations.start_date < NOW()
    AND course_realisations.start_date > NOW() - interval '24 months'
    AND NOT (course_units.course_code = ANY (organisations.disabled_course_codes))
    ${organisationId ? 'AND organisations.id = :organisationId' : ''};
  `
  return sequelize.query(query, {
    replacements: {
      questionIds,
      organisationId,
      validDataValues,
    },
    type: sequelize.QueryTypes.SELECT,
  })
}

const getCurrentCourseRealisationId = (rows) => {
  const rowsByCourseRealisationId = _.groupBy(
    rows,
    (row) => row.course_realisation_id,
  )

  const courseRealisations = Object.entries(rowsByCourseRealisationId).map(
    ([courseRealisationId, courseRealisationRows]) => {
      const { course_realisation_start_date: startDate } =
        courseRealisationRows[0]

      const { feedbackCount } = getCounts(courseRealisationRows)

      return {
        id: courseRealisationId,
        startDate: new Date(startDate),
        feedbackCount,
      }
    },
  )

  const sortedCourseRealisations = _.orderBy(
    courseRealisations,
    ['startDate', 'feedbackCount'],
    ['desc', 'desc'],
  )

  return sortedCourseRealisations[0].id
}

const getCourseUnitsWithResults = (rows, questions) => {
  const relevantRows = rows

  const rowsByCourseCode = _.groupBy(relevantRows, (row) => row.course_code)
  const courseUnits = Object.entries(rowsByCourseCode).map(
    ([courseCode, courseUnitRows]) => {
      const { course_unit_name: name } = courseUnitRows[0]

      const currentCourseRealisationId =
        getCurrentCourseRealisationId(courseUnitRows)

      const { current = [], previous = [] } = _.groupBy(courseUnitRows, (row) =>
        row.course_realisation_id === currentCourseRealisationId
          ? 'current'
          : 'previous',
      )

      const feedbackResponseGiven = Boolean(current[0]?.feedback_response_given)

      const closesAt = current[0]?.closes_at

      const currentResults = getResults(current, questions)
      const previousResults = getResults(previous, questions)
      const { feedbackCount, studentCount } = getCounts(current)
      const feedbackPercentage = feedbackCount / studentCount

      const results = currentResults.map((r) => {
        const previousQuestionResults = previousResults.find(
          (pr) => r.questionId === pr.questionId,
        )

        return {
          ...r,
          previous: previousQuestionResults?.mean
            ? previousQuestionResults
            : null,
        }
      })

      return {
        name,
        courseCode,
        results,
        feedbackCount,
        studentCount,
        feedbackPercentage,
        feedbackResponseGiven,
        closesAt,
      }
    },
  )

  return _.orderBy(courseUnits, ['courseCode'], ['asc'])
}

const createOrganisations = (rowsByOrganisationId, questions, openUni) => {
  // 400 ms
  const organisations = Object.entries(rowsByOrganisationId).map(
    ([organisationId, organisationRows]) => {
      const { organisation_name: name, organisation_code: code } =
        organisationRows[0]

      const courseUnits = getCourseUnitsWithResults(
        // 320 ms total
        organisationRows,
        questions,
        openUni,
      )

      const feedbackCount = _.sumBy(
        courseUnits,
        ({ feedbackCount }) => feedbackCount,
      )

      const studentCount = _.sumBy(
        courseUnits,
        ({ studentCount }) => studentCount,
      )

      const feedbackPercentage =
        studentCount > 0 ? feedbackCount / studentCount : 0

      const allResults = courseUnits.flatMap(({ results }) => results)

      const resultsByQuestionId = _.groupBy(allResults, ({ questionId }) =>
        questionId.toString(),
      )

      const results = questions.map(({ id: questionId }) => {
        const questionResults = resultsByQuestionId[questionId.toString()] ?? []

        const questionMeans = questionResults
          .map(({ mean }) => mean)
          .filter(Boolean)

        const distribution = questionResults.reduce(
          (acc, curr) =>
            _.mergeWith({}, acc, curr.distribution, (a, b) => (a ? a + b : b)),
          {},
        )

        return {
          questionId,
          mean:
            questionMeans.length > 0 ? _.round(_.mean(questionMeans), 2) : 0,
          distribution,
        }
      })

      return {
        id: organisationId,
        name,
        code,
        results,
        feedbackCount,
        studentCount,
        feedbackPercentage,
        courseUnits,
      }
    },
  )

  return organisations
}

const getOrganisationsWithResults = (rows, questions) => {
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = createOrganisations(rowsByOrganisationId, questions)

  return organisations
}

const withMissingOrganisations = (
  organisations,
  organisationAccess,
  questions,
) => {
  const accessibleOrganisations = organisationAccess.map(
    ({ organisation }) => organisation,
  )

  const missingOrganisations = accessibleOrganisations.filter(
    (org) => !organisations.find((otherOrg) => org.id === otherOrg.id),
  )

  const allOrganisations = [
    ...organisations,
    ...missingOrganisations.map((org) => ({
      id: org.id,
      name: org.name,
      code: org.code,
      courseUnits: [],
      results: questions.map(({ id: questionId }) => ({
        questionId,
        mean: 0,
        distribution: {},
      })),
      feedbackCount: 0,
      studentCount: 0,
      feedbackPercentage: 0,
    })),
  ]

  return _.orderBy(
    allOrganisations,
    [(org) => (org.courseUnits.length > 0 ? 1 : 0), 'code'],
    ['desc', 'asc'],
  )
}

const omitOrganisationOpenUniRows = async (rows) => {
  const courseRealisationIds = _.uniq(
    rows.map((row) => row.course_realisation_id),
  )
  const courseUnitIds = _.uniq(rows.map((row) => row.course_unit_id))

  const query = `
    SELECT NULL AS course_unit_id, course_realisation_id
    FROM course_realisations_organisations
    WHERE organisation_id = :openUniOrganisationId
    AND course_realisation_id IN (:courseRealisationIds)
    UNION
    SELECT NULL AS course_realisation_id, course_unit_id
    FROM course_units_organisations
    WHERE organisation_id = :openUniOrganisationId
    AND course_unit_id IN (:courseUnitIds);
  `

  const results = await sequelize.query(query, {
    replacements: {
      courseRealisationIds,
      courseUnitIds,
      openUniOrganisationId: OPEN_UNI_ORGANISATION_ID,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  const openUniCourseRealisationIds = results
    .map((r) => r.course_realisation_id)
    .filter(Boolean)
  const openUniCourseUnitIds = results
    .map((r) => r.course_unit_id)
    .filter(Boolean)

  const filtered = rows.filter(
    (r) =>
      !openUniCourseRealisationIds.includes(r.course_realisation_id) &&
      !openUniCourseUnitIds.includes(r.course_unit_id),
  )

  return filtered
}

const omitOpenUniRows = (rows) => {
  const openUniCourseRealisationIds = _.uniq(
    rows
      .filter((row) => row.organisation_id === OPEN_UNI_ORGANISATION_ID)
      .map((row) => row.course_realisation_id),
  )

  return rows.filter(
    (row) => !openUniCourseRealisationIds.includes(row.course_realisation_id),
  )
}

const getOrganisationQuestions = async (organisationCode) => {
  const programmeSurvey = await Survey.findOne({
    where: { type: 'programme', typeId: organisationCode },
  })

  if (programmeSurvey) await programmeSurvey.populateQuestions()
  const programmeQuestions = programmeSurvey ? programmeSurvey.questions : []

  const summaryQuestions = programmeQuestions.filter((q) => q.type === 'LIKERT')

  return summaryQuestions
}

const getUniversityQuestions = async () => {
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

const getSummaryByOrganisation = async ({
  organisationCode,
  includeOpenUniCourseUnits = true,
}) => {
  const universityQuestions = await getUniversityQuestions()
  const programmeQuestions = await getOrganisationQuestions(organisationCode)
  const questions = universityQuestions.concat(programmeQuestions)

  const validDataValues = getValidDataValues(questions)
  const questionIds = questions.map(({ id }) => id.toString())

  const organisation = await Organisation.findOne({
    where: { code: organisationCode },
  })

  const rows = await executeSummaryQuery({
    questionIds,
    organisationId: organisation.id,
    validDataValues,
  })

  const normalizedRows = !includeOpenUniCourseUnits
    ? await omitOrganisationOpenUniRows(rows)
    : rows

  const results = getOrganisationsWithResults(normalizedRows, questions)

  return { organisations: results, questions }
}

const getAllRowsFromDb = async () => {
  const questions = await getUniversityQuestions()
  const validDataValues = getValidDataValues(questions)
  const questionIds = questions.map(({ id }) => id.toString())

  const courseRealisationRows = await executeSummaryQuery({
    questionIds,
    validDataValues,
  })

  return courseRealisationRows
}

const cacheSummary = async (rows) => {
  // slow but run only in cronjob
  await FeedbackSummaryCache.destroy({ where: {} })

  const groupedRows = _.groupBy(
    rows,
    (row) => `${row.course_realisation_id}#${row.organisation_id}`,
  )
  const cacheRows = Object.entries(groupedRows).map(([key, value]) => {
    const [course_realisation_id, organisation_id] = key.split('#')
    return {
      course_realisation_id,
      organisation_id,
      data: value,
    }
  })

  await FeedbackSummaryCache.bulkCreate(cacheRows)
}

const getSummaryFromCache = async (organisationIds, courseRealisationIds) => {
  // 530 ms
  const cacheRows = await FeedbackSummaryCache.findAll({
    where: {
      [Op.or]: {
        organisation_id: {
          [Op.in]: organisationIds,
        },
        course_realisation_id: {
          /* eslint-disable-line camelcase */ [Op.in]: courseRealisationIds,
        },
      },
    },
  })

  return cacheRows.flatMap((row) => row.data)
}

const getOrganisationSummaries = async ({
  questions,
  organisationAccess,
  accessibleCourseRealisationIds,
  includeOpenUniCourseUnits = true,
}) => {
  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  const rows = await getSummaryFromCache(
    organisationIds,
    accessibleCourseRealisationIds,
  ) // ~530 ms db query
  if (rows.length === 0) {
    logger.warn(
      'Got empty array from courseSummaryCache, looks like kakku is not yet ready',
    )
  }

  const normalizedRows = !includeOpenUniCourseUnits
    ? await omitOpenUniRows(rows) // ~60 ms
    : rows

  const organisationsWithResults = getOrganisationsWithResults(
    normalizedRows,
    questions,
  ) // ~420 ms of pure epic mangling

  const organisationsWithMissing = withMissingOrganisations(
    // ~8 ms
    organisationsWithResults,
    organisationAccess,
    questions,
  )

  return _.sortBy(organisationsWithMissing, 'code')
}

const populateOrganisationSummaryCache = async () => {
  const rows = await getAllRowsFromDb()
  await cacheSummary(rows)
  logger.info(`Populated cache with ${rows.length} rows`)
}

module.exports = {
  getOrganisationSummaries,
  getSummaryByOrganisation,
  populateOrganisationSummaryCache,
}
