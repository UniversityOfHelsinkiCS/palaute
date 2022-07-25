/* eslint-disable camelcase, no-console */
const _ = require('lodash')

const { Op } = require('sequelize')
const { subMonths } = require('date-fns')

const { sequelize } = require('../dbConnection')
const { Survey, Organisation } = require('../../models')

const {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
  getUniversityQuestions,
} = require('./utils')
const logger = require('../logger')
const { getSummaryFromCache } = require('./cache')

const OPEN_UNI_ORGANISATION_ID = 'hy-org-48645785'
const ALL_OPEN_UNI_ORGANISATION_IDS = [
  OPEN_UNI_ORGANISATION_ID,
  'hy-org-48901898', // "Lukuvuosi"
  'hy-org-48902017', // "Kesälukukausi"
]

const executeSummaryQuery = ({
  questionIds,
  organisationId,
  validDataValues,
  since = subMonths(new Date(), 24),
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
    student_count,
    fbt.feedback_count as feedback_count,
    fbt.id AS feedback_target_id,
    fbt.closes_at AS closes_at,
    fbt.feedback_response_email_sent AS feedback_response_given,
    cur.id AS course_realisation_id,
    cur.start_date AS course_realisation_start_date,
    cur.end_date AS course_realisation_end_date,
    cu.course_code AS course_code,
    cu.name AS course_unit_name,
    cu.id AS course_unit_id,
    org.id AS organisation_id
  FROM question_averages
    INNER JOIN feedback_targets as fbt ON question_averages.feedback_target_id = fbt.id
    INNER JOIN course_units as cu ON fbt.course_unit_id = cu.id
    INNER JOIN course_units_organisations as cuo ON cu.id = cuo.course_unit_id
    INNER JOIN course_realisations as cur ON fbt.course_realisation_id = cur.id
  
    INNER JOIN LATERAL (
      SELECT organisation_id FROM course_realisations_organisations WHERE course_realisation_id = cur.id
      UNION
      SELECT organisation_id FROM course_units_organisations WHERE course_unit_id = cu.id
    ) organisation_access ON TRUE
  
    INNER JOIN organisations as org ON organisation_access.organisation_id = org.id
    INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = fbt.id
  WHERE
    fbt.feedback_type = 'courseRealisation'
    AND cur.start_date < NOW()
    AND cur.start_date > :since
    AND NOT (cu.course_code = ANY (org.disabled_course_codes))
    ${organisationId ? 'AND org.id = :organisationId' : ''};
  `
  return sequelize.query(query, {
    replacements: {
      questionIds,
      organisationId,
      validDataValues,
      since,
    },
    type: sequelize.QueryTypes.SELECT,
  })
}

const getCourseUnitsWithResults = (rows, questions) => {
  const rowsByCourseCode = _.groupBy(rows, (row) => row.course_code)

  const courseUnits = Object.entries(rowsByCourseCode).map(
    ([courseCode, courseUnitRows]) => {
      //===== get latest relevant CUR of CU to see if its feedback response is given =======//
      const rowsByCourseRealisationId = _.groupBy(
        courseUnitRows,
        (row) => row.course_realisation_id,
      )

      let feedbackCountSum = 0
      let studentCountSum = 0

      // find the latest cur's id with most feedbacks. Also count the sum of feedbacks and students
      let currentId = Object.keys(rowsByCourseRealisationId)[0]
      let currentRank = -1

      Object.entries(rowsByCourseRealisationId).forEach(
        ([courseRealisationId, courseRealisationRows]) => {
          const { feedbackCount, studentCount } = getCounts(
            courseRealisationRows,
          )
          feedbackCountSum += feedbackCount
          studentCountSum += studentCount

          const rank =
            Date.parse(courseRealisationRows[0].course_realisation_start_date) *
              10_000 +
            feedbackCount // assuming no course has over 10_000 feedbacks

          if (rank > currentRank) {
            currentRank = rank
            currentId = courseRealisationId
          }
        },
      )

      const current = courseUnitRows.find(
        (row) => row.course_realisation_id === currentId,
      )

      const results = getResults(courseUnitRows, questions)

      return {
        name: courseUnitRows[0].course_unit_name,
        courseCode,
        results,
        feedbackCount: feedbackCountSum,
        studentCount: studentCountSum,
        feedbackPercentage: feedbackCountSum / studentCountSum,
        feedbackResponseGiven: Boolean(current?.feedback_response_given),
        currentFeedbackTargetId: current.feedback_target_id,
        closesAt: current?.closes_at,
      }
    },
  )

  const sortedCourseUnits = _.orderBy(courseUnits, ['courseCode'], ['asc'])

  return sortedCourseUnits
}

const createOrganisations = (rowsByOrganisationId, questions) => {
  console.time('--organisationsWithCourseUnits')

  const organisationsWithCourseUnits = Object.entries(rowsByOrganisationId).map(
    ([organisationId, organisationRows]) => {
      const courseUnits = getCourseUnitsWithResults(organisationRows, questions)
      return {
        id: organisationId,
        courseUnits,
      }
    },
  )
  console.timeEnd('--organisationsWithCourseUnits')

  console.time('--organisationsWithResults')
  const organisationsWithResults = organisationsWithCourseUnits.map((org) => {
    const { courseUnits } = org
    const studentCount = _.sumBy(
      courseUnits,
      ({ studentCount }) => studentCount,
    )
    const feedbackCount = _.sumBy(
      courseUnits,
      ({ feedbackCount }) => feedbackCount,
    )

    const allResults = courseUnits.flatMap((cu) =>
      cu.results.map((r) => ({ ...r, count: cu.feedbackCount })),
    )

    const resultsByQuestionId = _.groupBy(allResults, ({ questionId }) =>
      questionId.toString(),
    )

    const results = questions.map(({ id: questionId }) => {
      const questionResults = resultsByQuestionId[questionId.toString()] ?? []

      const distribution = questionResults.reduce(
        (acc, curr) =>
          _.mergeWith({}, acc, curr.distribution, (a, b) => (a ? a + b : b)),
        {},
      )

      const mean =
        questionResults.length > 0
          ? _.round(
              _.sumBy(questionResults, (r) => r.mean * r.count) / feedbackCount,
              2,
            )
          : 0

      return {
        questionId,
        mean,
        distribution,
      }
    })

    return {
      ...org,
      results,
      feedbackCount,
      studentCount,
      feedbackPercentage: studentCount > 0 ? feedbackCount / studentCount : 0,
    }
  })

  console.timeEnd('--organisationsWithResults')

  return organisationsWithResults
}

const getOrganisationsWithResults = (rows, questions) => {
  console.time('-getOrganisationsWithResults')
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = createOrganisations(rowsByOrganisationId, questions)

  console.timeEnd('-getOrganisationsWithResults')
  return organisations
}

const getOpenUniOrganisationWithResults = (rows, questions) => {
  if (!rows || rows.length === 0) {
    return []
  }
  const rowsByOrganisationId = {
    [OPEN_UNI_ORGANISATION_ID]: rows.filter(
      (row) => row.organisation_id === OPEN_UNI_ORGANISATION_ID,
    ),
  }
  const organisations = createOrganisations(rowsByOrganisationId, questions)
  return organisations[0]
}

const includeEmptyOrganisations = (
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
    [(org) => (org.courseUnits.length > 0 ? 1 : 0)],
    ['desc'],
  )
}

const omitOrganisationOpenUniRows = async (rows) => {
  let courseRealisationIds = _.uniq(
    rows.map((row) => row.course_realisation_id),
  )
  if (!courseRealisationIds || courseRealisationIds.length === 0) {
    courseRealisationIds = '_'
  }
  let courseUnitIds = _.uniq(rows.map((row) => row.course_unit_id))
  if (!courseUnitIds || courseUnitIds.length === 0) {
    courseUnitIds = '_'
  }

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

const partitionOpenUniRows = (rows) => {
  console.time('-partitionOpenUniRows')

  const sortedRows = rows.sort((a, b) =>
    a.course_realisation_id.localeCompare(b.course_realisation_id),
  )

  const openUniCourseRealisationIds = _.sortedUniq(
    sortedRows
      .filter((row) => row.organisation_id === OPEN_UNI_ORGANISATION_ID)
      .map((row) => row.course_realisation_id),
  )

  const openUni = []
  const justUni = []

  let j = 0
  for (let i = 0; i < sortedRows.length; i++) {
    const row = sortedRows[i]
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const k = row.course_realisation_id.localeCompare(
        openUniCourseRealisationIds[j],
      )
      if (k === 0) {
        openUni.push(row)
        break
      } else if (k < 0) {
        justUni.push(row)
        break
      }
      j++
    }
  }
  console.timeEnd('-partitionOpenUniRows')

  return [justUni, openUni]
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

const addOrganisationInfo = async (organisations) => {
  console.time('-addOrganisationInfo')
  const sorted = _.sortBy(organisations, 'id')

  const orgNames = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    where: {
      id: {
        [Op.in]: sorted.map((org) => org.id),
      },
    },
    order: [['id', 'asc']],
  })
  const result = sorted.map((org, index) => ({
    ...org,
    ...orgNames[index].dataValues,
  }))
  const sortedResult = _.sortBy(result, 'code')
  console.timeEnd('-addOrganisationInfo')
  return sortedResult
}

const getSummaryByOrganisation = async ({
  organisationCode,
  includeOpenUniCourseUnits = true,
}) => {
  console.time('getQuestions')
  const universityQuestions = await getUniversityQuestions()
  const programmeQuestions = await getOrganisationQuestions(organisationCode)
  const questions = universityQuestions.concat(programmeQuestions)

  const validDataValues = getValidDataValues(questions)
  const questionIds = questions.map(({ id }) => id.toString())
  console.timeEnd('getQuestions')

  const organisation = await Organisation.findOne({
    where: { code: organisationCode },
  })

  console.time('executeSummaryQuery')
  const rows = await executeSummaryQuery({
    questionIds,
    organisationId: organisation.id,
    validDataValues,
  })
  console.timeEnd('executeSummaryQuery')

  console.time('omitOrganisationOpenUniRows')
  const normalizedRows = !includeOpenUniCourseUnits
    ? await omitOrganisationOpenUniRows(rows)
    : rows
  console.timeEnd('omitOrganisationOpenUniRows')

  const results = getOrganisationsWithResults(normalizedRows, questions)
  // must add name and code to the result json
  results[0] = {
    name: organisation.name,
    code: organisation.code,
    ...results[0],
  }

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

const getOrganisationSummaries = async ({
  questions,
  organisationAccess,
  accessibleCourseRealisationIds,
  includeOpenUniCourseUnits = true,
  startDate = subMonths(Date.now(), 24),
  endDate = Date.now(),
}) => {
  console.time('getOrganisationSummaries')

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  const rows = await getSummaryFromCache(
    organisationIds,
    accessibleCourseRealisationIds,
    startDate,
    endDate,
  )
  if (rows.length === 0) {
    logger.warn(
      'Got empty array from courseSummaryCache, looks like kakku is not yet ready',
    )
  }

  const partitionedRows = partitionOpenUniRows(rows)

  const [normalizedRows, openUniRows] = !includeOpenUniCourseUnits
    ? partitionedRows
    : [rows, partitionedRows[1]]

  const organisationsWithResults = getOrganisationsWithResults(
    normalizedRows,
    questions,
  )

  const openUniOrganisationWithResults = getOpenUniOrganisationWithResults(
    openUniRows,
    questions,
  )

  const organisationsWithMissing = includeEmptyOrganisations(
    organisationsWithResults,
    organisationAccess,
    questions,
  ).filter((org) => !ALL_OPEN_UNI_ORGANISATION_IDS.includes(org.id))

  const allOrganisations = organisationsWithMissing.concat(
    openUniOrganisationWithResults,
  )

  const result = await addOrganisationInfo(allOrganisations)

  console.timeEnd('getOrganisationSummaries')

  return result
}

module.exports = {
  getOrganisationSummaries,
  getSummaryByOrganisation,
  getAllRowsFromDb,
}
