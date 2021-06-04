const _ = require('lodash')
const { Op } = require('sequelize')

const { CourseUnit, Organisation } = require('../models')
const { sequelize } = require('./dbConnection')

const QUESTION_AVERAGES_QUERY = `
SELECT
  feedback_target_id,
  question_id,
  avg(int_question_data) AS question_avg
FROM
  (
    SELECT
      feedback_id,
      feedback_target_id,
      question_id,
      int_question_data
    FROM
      user_feedback_targets
      INNER JOIN (
        SELECT
          id,
          question_id,
          cast(question_data AS INTEGER) int_question_data
        FROM
          (
            SELECT
              id,
              question_feedback :: jsonb ->> 'questionId' AS question_id,
              question_feedback :: jsonb ->> 'data' AS question_data
            FROM
              (
                SELECT
                  id,
                  user_id,
                  jsonb_array_elements_text(data) AS question_feedback
                FROM
                  feedbacks
              ) feedbacks_1
          ) feedbacks_2
        WHERE
          question_data IN ('1', '2', '3', '4', '5')
      ) feedbacks_3 ON user_feedback_targets.feedback_id = feedbacks_3.id
    WHERE
      user_feedback_targets.access_status = 'STUDENT'
      AND feedbacks_3.question_id IN (:questionIds)
  ) as feedbacks_4
GROUP BY
  feedback_target_id,
  question_id
`

const COUNTS_QUERY = `
SELECT
  feedback_target_id,
  COUNT(*) AS student_count,
  COUNT(feedback_id) AS feedback_count
FROM
  user_feedback_targets
WHERE
  user_feedback_targets.access_status = 'STUDENT'
GROUP BY
  feedback_target_id
`

const ORGANISATION_SUMMARY_QUERY = `
WITH question_averages AS (
  ${QUESTION_AVERAGES_QUERY}
), feedback_counts AS (
  ${COUNTS_QUERY}
)


SELECT
  question_id,
  question_avg,
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
  INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
  INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
  INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
  INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = feedback_targets.id
WHERE
  feedback_targets.feedback_type = 'courseRealisation'
  AND course_units.course_code IN (:courseCodes)
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '72 months';

`

const COURSE_REALISATION_SUMMARY_QUERY = `
WITH question_averages AS (
  ${QUESTION_AVERAGES_QUERY}
), feedback_counts AS (
  ${COUNTS_QUERY}
)


SELECT
  question_id,
  question_avg,
  feedback_count,
  student_count,
  feedback_targets.id AS feedback_target_id,
  feedback_targets.closes_at AS closes_at,
  course_realisations.id AS course_realisation_id,
  course_realisations.name AS course_realisation_name,
  course_realisations.start_date AS course_realisation_start_date,
  course_realisations.end_date AS course_realisation_end_date,
  course_units.course_code AS course_code,
  CASE
    WHEN feedback_targets.feedback_response IS NOT NULL
    AND char_length(feedback_targets.feedback_response) > 0 THEN TRUE
    ELSE FALSE
  END AS feedback_response_given
FROM question_averages
  INNER JOIN feedback_targets ON question_averages.feedback_target_id = feedback_targets.id
  INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
  INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
  INNER JOIN feedback_counts ON feedback_counts.feedback_target_id = feedback_targets.id
WHERE
  feedback_targets.feedback_type = 'courseRealisation'
  AND course_unit_id = :courseUnitId
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '36 months';
`

const getFeedbackMean = (rows) =>
  rows.length > 0
    ? _.round(
        _.meanBy(rows, (row) => parseFloat(row.question_avg)),
        2,
      )
    : null

const getCounts = (rows) => {
  const uniqueFeedbackTargets = _.uniqBy(rows, (row) => row.feedback_target_id)

  const feedbackCount = _.sumBy(uniqueFeedbackTargets, (row) =>
    parseInt(row.feedback_count, 10),
  )

  const studentCount = _.sumBy(uniqueFeedbackTargets, (row) =>
    parseInt(row.student_count, 10),
  )

  return {
    feedbackCount,
    studentCount,
  }
}

const getResults = (rows, questionIds) => {
  const rowsByQuestionId = _.groupBy(rows, (row) => row.question_id.toString())

  const results = questionIds.map((questionId) => {
    const questionRows = rowsByQuestionId[questionId.toString()] ?? []
    const mean = getFeedbackMean(questionRows)

    return {
      questionId,
      mean,
    }
  })

  return results
}

const OPEN_UNI_ORGANISATION_ID = 'hy-org-48645785'

const mapOpenUniOrganisations = async (rows) => {
  const openUniCodes = _.uniq(
    rows
      .filter((row) => row.organisation_id === OPEN_UNI_ORGANISATION_ID)
      .map((row) => row.course_code),
  )

  const baseCodes = _.uniq(openUniCodes.map((code) => code.replace(/^AY/, '')))

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode: {
        [Op.in]: baseCodes,
      },
    },
    include: [
      {
        model: Organisation,
        as: 'organisations',
        attributes: ['id', 'name', 'code'],
      },
    ],
    attributes: ['courseCode'],
  })

  const mapping = {}

  openUniCodes.forEach((code) => {
    const baseCode = code.replace(/^AY/, '')

    const courseUnit = courseUnits.find((c) => c.courseCode === baseCode)
    const organisation = courseUnit?.organisations[0]

    if (organisation) {
      mapping[code] = organisation
    }
  })

  return rows.map((row) => {
    const mappedOrganisation = mapping[row.course_code]

    return row.organisation_id === OPEN_UNI_ORGANISATION_ID &&
      mappedOrganisation
      ? {
          ...row,
          organisation_id: mappedOrganisation.id,
          organisation_name: mappedOrganisation.name,
          organisation_code: mappedOrganisation.code,
        }
      : row
  })
}

const getCourseUnitsWithResults = (rows, questionIds) => {
  const rowsByCourseUnitId = _.groupBy(rows, (row) => row.course_unit_id)

  const courseUnits = Object.entries(rowsByCourseUnitId).map(
    ([courseUnitId, courseUnitRows]) => {
      const {
        course_unit_name: name,
        course_code: courseCode,
        closes_at: closesAt,
      } = courseUnitRows[0]

      const latestRow = _.maxBy(
        courseUnitRows,
        (row) => new Date(row.course_realisation_start_date),
      )

      const { current = [], previous = [] } = _.groupBy(courseUnitRows, (row) =>
        row.course_realisation_id === latestRow.course_realisation_id
          ? 'current'
          : 'previous',
      )

      const feedbackResponseGiven = Boolean(current[0]?.feedback_response_given)

      const currentResults = getResults(current, questionIds)
      const previousResults = getResults(previous, questionIds)
      const { feedbackCount, studentCount } = getCounts(current)

      const resultsDifference = currentResults.map(
        ({ questionId, value }, index) => {
          const { value: comparedValue } = previousResults[index]

          return {
            questionId,
            mean: comparedValue ? _.round(value - comparedValue, 2) : null,
          }
        },
      )

      return {
        id: courseUnitId,
        name,
        courseCode,
        results: currentResults,
        resultsDifference,
        feedbackCount,
        studentCount,
        feedbackResponseGiven,
        closesAt,
      }
    },
  )

  return _.orderBy(courseUnits, ['courseCode'])
}

const getOrganisationsWithResults = (rows, questionIds) => {
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = Object.entries(rowsByOrganisationId).map(
    ([organisationId, organisationRows]) => {
      const {
        organisation_name: name,
        organisation_code: code,
      } = organisationRows[0]

      const courseUnits = getCourseUnitsWithResults(
        organisationRows,
        questionIds,
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

      const results = questionIds.map((questionId) => {
        const questionMeans = (resultsByQuestionId[questionId.toString()] ?? [])
          .map(({ mean }) => mean)
          .filter(Boolean)

        return {
          questionId,
          mean:
            questionMeans.length > 0 ? _.round(_.mean(questionMeans), 2) : null,
        }
      })

      return {
        id: organisationId,
        name,
        code,
        results,
        feedbackCount,
        studentCount,
        courseUnits,
      }
    },
  )

  return _.orderBy(organisations, ['code'])
}

const getCourseRealisationsWithResults = (rows, questionIds) => {
  const rowsByCourseRealisationId = _.groupBy(
    rows,
    (row) => row.course_realisation_id,
  )

  const courseRealisations = Object.entries(rowsByCourseRealisationId).map(
    ([courseRealisationId, courseRealisationRows]) => {
      const {
        course_realisation_name: name,
        course_realisation_start_date: startDate,
        course_realisation_end_date: endDate,
        feedback_response_given: feedbackResponseGiven,
        course_code: courseCode,
        feedback_target_id: feedbackTargetId,
        closes_at: closesAt,
      } = courseRealisationRows[0]

      const results = getResults(courseRealisationRows, questionIds)

      const { feedbackCount, studentCount } = getCounts(courseRealisationRows)

      return {
        courseCode,
        id: courseRealisationId,
        name,
        startDate,
        endDate,
        results,
        feedbackCount,
        studentCount,
        feedbackResponseGiven,
        feedbackTargetId,
        closesAt,
      }
    },
  )

  return _.orderBy(courseRealisations, ['startDate'], ['desc'])
}

const getOrganisationSummaries = async ({ questionIds, courseCodes }) => {
  const rows = await sequelize.query(ORGANISATION_SUMMARY_QUERY, {
    replacements: {
      questionIds: questionIds.map((id) => id.toString()),
      courseCodes,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  const normalizedRows = await mapOpenUniOrganisations(rows)

  return getOrganisationsWithResults(normalizedRows, questionIds)
}

const getCourseRealisationSummaries = async ({ courseUnitId, questionIds }) => {
  const rows = await sequelize.query(COURSE_REALISATION_SUMMARY_QUERY, {
    replacements: {
      questionIds: questionIds.map((id) => id.toString()),
      courseUnitId,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  return getCourseRealisationsWithResults(rows, questionIds)
}

module.exports = {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
}
