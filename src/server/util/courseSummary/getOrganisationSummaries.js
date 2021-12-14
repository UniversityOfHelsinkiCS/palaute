const _ = require('lodash')

const { sequelize } = require('../dbConnection')

const {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
} = require('./utils')

const OPEN_UNI_ORGANISATION_ID = 'hy-org-48645785'

const ORGANISATION_SUMMARY_QUERY = `
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
  course_realisations_organisations.organisation_id AS course_realisations_organisation_id,
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
  INNER JOIN course_realisations_organisations ON course_realisations.id = course_realisations_organisations.course_realisation_id
  INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
  INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = feedback_targets.id
WHERE
  feedback_targets.feedback_type = 'courseRealisation'
  AND (organisations.id IN (:organisationIds) OR course_realisations.id IN (:accessibleCourseRealisationIds))
  AND course_units.course_code NOT IN (:disabledCourseCodes)
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '48 months';
`

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

const getCourseUnitsWithResults = (rows, questions, openUni) => {
  const relevantRows = !openUni
    ? rows
    : rows.filter(
        (row) => row.course_realisations_organisation_id === 'hy-org-48645785',
      )

  const rowsByCourseCode = _.groupBy(relevantRows, (row) => row.course_code)
  const courseUnits = Object.entries(rowsByCourseCode).map(
    ([courseCode, courseUnitRows]) => {
      const { course_unit_name: name, closes_at: closesAt } = courseUnitRows[0]

      const currentCourseRealisationId =
        getCurrentCourseRealisationId(courseUnitRows)

      const { current = [], previous = [] } = _.groupBy(courseUnitRows, (row) =>
        row.course_realisation_id === currentCourseRealisationId
          ? 'current'
          : 'previous',
      )

      const feedbackResponseGiven = Boolean(current[0]?.feedback_response_given)

      const currentResults = getResults(current, questions)
      const previousResults = getResults(previous, questions)
      const { feedbackCount, studentCount } = getCounts(current)

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
        feedbackResponseGiven,
        closesAt,
      }
    },
  )

  return _.orderBy(courseUnits, ['courseCode'], ['asc'])
}

const createOrganisations = (rowsByOrganisationId, questions, openUni) => {
  const organisations = Object.entries(rowsByOrganisationId).map(
    ([organisationId, organisationRows]) => {
      const { organisation_name: name, organisation_code: code } =
        organisationRows[0]

      const courseUnits = getCourseUnitsWithResults(
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
        id: openUni ? 'hy-org-48645785' : organisationId,
        name: openUni
          ? {
              en: 'Open University',
              fi: 'Avoin yliopisto',
              sv: 'Öppna universitetet',
            }
          : name,
        code: openUni ? 'H930' : code,
        results,
        feedbackCount,
        studentCount,
        courseUnits,
      }
    },
  )

  return organisations
}

const getOrganisationsWithResults = (rows, questions, allRows) => {
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = createOrganisations(
    rowsByOrganisationId,
    questions,
    false,
  )

  const allRowsById = _.groupBy(allRows, (row) => row.organisation_id)

  const openUniOrganisation = createOrganisations(allRowsById, questions, true)

  const allOrganisations = organisations.concat(openUniOrganisation)

  return _.orderBy(allOrganisations, ['code'], ['asc'])
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
    })),
  ]

  return _.orderBy(
    allOrganisations,
    [(org) => (org.courseUnits.length > 0 ? 1 : 0), 'code'],
    ['desc', 'asc'],
  )
}

const omitOpenUniRows = async (rows) => {
  const openUniRows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_units.course_code) course_units.course_code FROM course_units_organisations
    INNER JOIN course_units ON course_units_organisations.course_unit_id = course_units.id
    WHERE course_units_organisations.organisation_id = :openUniOrganisationId;
  `,
    {
      replacements: {
        openUniOrganisationId: OPEN_UNI_ORGANISATION_ID,
      },
      type: sequelize.QueryTypes.SELECT,
    },
  )

  const openUniCourseCodes = openUniRows.map((row) => row.course_code)

  return rows.filter((row) => !openUniCourseCodes.includes(row.course_code))
}

const getOrganisationSummaries = async ({
  questions,
  organisationAccess,
  accessibleCourseRealisationIds,
  includeOpenUniCourseUnits = true,
}) => {
  const validDataValues = getValidDataValues(questions)
  const questionIds = questions.map(({ id }) => id.toString())

  const organisations = organisationAccess.map(
    ({ organisation }) => organisation,
  )

  const organisationIds = organisations.map(({ id }) => id)

  const disabledCourseCodes = organisations.flatMap(
    ({ disabledCourseCodes }) => disabledCourseCodes ?? [],
  )

  const rows =
    organisationIds.length > 0 || accessibleCourseRealisationIds.length > 0
      ? await sequelize.query(ORGANISATION_SUMMARY_QUERY, {
          replacements: {
            questionIds,
            organisationIds: [
              ...organisationIds,
              '_', // in case of empty array
            ],
            validDataValues,
            disabledCourseCodes: [...disabledCourseCodes, '_'],
            accessibleCourseRealisationIds: [
              ...accessibleCourseRealisationIds,
              '_',
            ],
          },
          type: sequelize.QueryTypes.SELECT,
        })
      : []

  const normalizedRows = !includeOpenUniCourseUnits
    ? await omitOpenUniRows(rows)
    : rows

  const organisationsWithMissing = withMissingOrganisations(
    getOrganisationsWithResults(normalizedRows, questions, rows),
    organisationAccess,
    questions,
  )

  return organisationsWithMissing
}

module.exports = {
  getOrganisationSummaries,
}
