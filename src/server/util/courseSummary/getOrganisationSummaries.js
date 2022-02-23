const _ = require('lodash')

const { sequelize } = require('../dbConnection')
const { redisClient } = require('../redisClient')

const {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
} = require('./utils')

const OPEN_UNI_ORGANISATION_ID = 'hy-org-48645785'

const openUniversityValues = {
  id: 'hy-org-48645785',
  name: {
    en: 'Open University',
    fi: 'Avoin yliopisto',
    sv: 'Öppna universitetet',
  },
  code: 'H930',
  defaultQuestions: [
    { questionId: 6, mean: 0, distribution: {} },
    { questionId: 7, mean: 0, distribution: {} },
    { questionId: 8, mean: 0, distribution: {} },
    { questionId: 9, mean: 0, distribution: {} },
    { questionId: 1042, mean: 0, distribution: {} },
  ],
}

const ORGANISATION_SUMMARY_QUERY_BY_REALISATIONS = `
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
  INNER JOIN organisations ON course_realisations_organisations.organisation_id = organisations.id
  INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = feedback_targets.id
WHERE
  feedback_targets.feedback_type = 'courseRealisation'
  AND (organisations.id IN (:organisationIds) OR course_realisations.id IN (:accessibleCourseRealisationIds))
  AND course_units.course_code NOT IN (:disabledCourseCodes)
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '48 months';
`

const ORGANISATION_SUMMARY_QUERY_BY_UNITS = `
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
        (row) =>
          row.course_realisations_organisation_id === OPEN_UNI_ORGANISATION_ID,
      )

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
        id: openUni ? openUniversityValues.id : organisationId,
        name: openUni ? openUniversityValues.name : name,
        code: openUni ? openUniversityValues.code : code,
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

const createOpenUniOrganisation = (openUniOrganisations) => {
  if (openUniOrganisations.length < 2) return openUniOrganisations

  const openUniOrganisationCourseUnits = openUniOrganisations.reduce(
    (allCourseUnits, { courseUnits }) => allCourseUnits.concat(courseUnits),
    [],
  )

  const seen = new Set()
  const uniqueCourseUnits = openUniOrganisationCourseUnits.filter((c) => {
    const duplicate = seen.has(c.courseCode)
    seen.add(c.courseCode)
    return !duplicate
  })

  const counts = uniqueCourseUnits.reduce(
    (countSums, { feedbackCount, studentCount }) => ({
      feedbackCount: countSums.feedbackCount + feedbackCount,
      studentCount: countSums.studentCount + studentCount,
    }),
    { feedbackCount: 0, studentCount: 0 },
  )

  const feedbackPercentage =
    counts.studentCount > 0 ? counts.feedbackCount / counts.studentCount : 0

  let divider = 0

  const results = uniqueCourseUnits.reduce((allResults, { results }) => {
    if (results[0].mean !== 0) divider += 1
    const result = results.map((r, index) => ({
      questionId: r.questionId,
      mean: allResults[index].mean + r.mean,
      distribution: r.distribution,
    }))
    return result
  }, openUniversityValues.defaultQuestions)

  const dividedResults = results.map((r) => ({
    ...r,
    mean: (r.mean / divider).toFixed(2),
  }))

  const openUniOrganisation = [
    {
      id: openUniversityValues.id,
      name: openUniversityValues.name,
      code: openUniversityValues.code,
      courseUnits: uniqueCourseUnits,
      feedbackCount: counts.feedbackCount,
      studentCount: counts.studentCount,
      feedbackPercentage,
      results: dividedResults,
    },
  ]

  return openUniOrganisation
}

const getOrganisationsWithResults = (rows, questions, allRows) => {
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = createOrganisations(
    rowsByOrganisationId,
    questions,
    false,
  )

  const filteredOrganisations = organisations.filter(
    (org) => org.id !== OPEN_UNI_ORGANISATION_ID,
  )

  const allRowsById = _.groupBy(allRows, (row) => row.organisation_id)

  const openUniOrganisations = createOrganisations(allRowsById, questions, true)

  const openUniOrganisation = createOpenUniOrganisation(openUniOrganisations)

  const allOrganisations =
    openUniOrganisation[0] && openUniOrganisation[0].courseUnits.length > 0
      ? filteredOrganisations.concat(openUniOrganisation)
      : filteredOrganisations

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
      feedbackPercentage: 0,
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

const cacheOrganisationSummaries = (organisations) => {
  organisations.forEach((organisation) => {
    redisClient.set(organisation.id, JSON.stringify(organisation))
  })
}

const getCachedOrganisationSummaries = (organisationIds) =>
  Promise.all(organisationIds.map((id) => redisClient.get(id).then(JSON.parse)))

const getOrganisationSummariesFromDb = async (
  questions,
  organisationAccess,
  accessibleCourseRealisationIds,
  includeOpenUniCourseUnits = true,
) => {
  const validDataValues = getValidDataValues(questions)
  const questionIds = questions.map(({ id }) => id.toString())

  const organisations = organisationAccess.map(
    ({ organisation }) => organisation,
  )

  const disabledCourseCodes = organisations.flatMap(
    ({ disabledCourseCodes }) => disabledCourseCodes ?? [],
  )

  const organisationIds = organisations.map(({ id }) => id)

  const rowsByRealisations =
    organisationIds.length > 0 || accessibleCourseRealisationIds.length > 0
      ? sequelize.query(ORGANISATION_SUMMARY_QUERY_BY_REALISATIONS, {
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

  const rowsByUnits =
    organisationIds.length > 0 || accessibleCourseRealisationIds.length > 0
      ? sequelize.query(ORGANISATION_SUMMARY_QUERY_BY_UNITS, {
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
    ? await omitOpenUniRows(await rowsByRealisations)
    : await rowsByUnits

  const organisationsWithMissing = withMissingOrganisations(
    getOrganisationsWithResults(normalizedRows, questions, rowsByRealisations),
    organisationAccess,
    questions,
  )

  return organisationsWithMissing
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

  const cachedOrganisations = (
    await getCachedOrganisationSummaries(organisationIds)
  ).filter((org) => org !== null)
  const cachedIds = cachedOrganisations.map((org) => org.id)

  // filter out all orgs found in cache
  const remainingOrganisationAccess = organisationAccess.filter(
    (oa) => !cachedIds.some((id) => id === oa.organisation.id),
  )

  const organisationsFromDb =
    remainingOrganisationAccess.length > 0 ||
    accessibleCourseRealisationIds.length > 0
      ? await getOrganisationSummariesFromDb(
          questions,
          remainingOrganisationAccess,
          accessibleCourseRealisationIds,
          includeOpenUniCourseUnits,
        )
      : []

  cacheOrganisationSummaries(organisationsFromDb)

  const allOrganisations = cachedOrganisations
    .concat(organisationsFromDb)
    .sort((org1, org2) => org1.code.localeCompare(org2.code))

  return allOrganisations
}

module.exports = {
  getOrganisationSummaries,
}
