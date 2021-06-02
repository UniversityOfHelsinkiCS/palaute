const _ = require('lodash')

const { sequelize } = require('./dbConnection')

const FEEDBACKS_QUERY = `
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
  question_data IN ('0', '1', '2', '3', '4', '5')
`

const ORGANISATION_SUMMARY_QUERY = `
SELECT
  *
FROM
  (
    SELECT
      question_id,
      course_realisation_id,
      int_question_data,
      feedback_response_given,
      course_realisation_start_date,
      course_realisation_end_date,
      course_unit_id,
      course_unit_name,
      course_code,
      feedback_id,
      organisation_id,
      organisation_name,
      organisation_code,
      rank() OVER (
        PARTITION BY course_realisation_id
        ORDER BY
          course_realisation_start_date DESC
      ) AS course_realisation_index
    FROM
      (
        SELECT
          feedbacks_3.int_question_data AS int_question_data,
          feedbacks_3.question_id,
          user_feedback_targets.feedback_id AS feedback_id,
          course_realisations.id AS course_realisation_id,
          course_realisations.name AS course_realisation_name,
          course_realisations.start_date AS course_realisation_start_date,
          course_realisations.end_date AS course_realisation_end_date,
          course_units.id AS course_unit_id,
          course_units.course_code AS course_code,
          course_units.name AS course_unit_name,
          organisations.id AS organisation_id,
          organisations.name AS organisation_name,
          organisations.code AS organisation_code,
          CASE 
            WHEN feedback_targets.feedback_response IS NOT NULL AND char_length(feedback_targets.feedback_response) > 0 THEN TRUE
            ELSE FALSE
          END AS feedback_response_given
        FROM
          user_feedback_targets
          INNER JOIN (
            ${FEEDBACKS_QUERY}
          ) feedbacks_3 ON user_feedback_targets.feedback_id = feedbacks_3.id
          INNER JOIN feedback_targets ON feedback_targets.id = user_feedback_targets.feedback_target_id
          INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
          INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
          INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
          INNER JOIN organisations ON course_units_organisations.organisation_id = organisations.id
        WHERE
          feedback_targets.feedback_type = 'courseRealisation'
          AND feedbacks_3.question_id IN (:questionIds)
          AND user_feedback_targets.access_status = 'STUDENT'
          AND course_units.course_code IN (:courseCodes)
          AND course_realisations.start_date < NOW()
      ) feedbacks_4
  ) feedbacks_5
WHERE
  course_realisation_index <= 4;
`

const COURSE_REALISATION_SUMMARY_QUERY = `
SELECT
  *
FROM
  (
    SELECT
      question_id,
      course_realisation_id,
      int_question_data,
      feedback_response_given,
      course_realisation_start_date,
      course_realisation_end_date,
      course_unit_id,
      course_unit_name,
      course_code,
      feedback_id,
      feedback_target_id,
      rank() OVER (
        PARTITION BY course_realisation_id
        ORDER BY
          course_realisation_start_date DESC
      ) AS course_realisation_index
    FROM
      (
        SELECT
          feedbacks_3.int_question_data AS int_question_data,
          feedbacks_3.question_id,
          user_feedback_targets.feedback_id AS feedback_id,
          user_feedback_targets.feedback_target_id as feedback_target_id,
          course_realisations.id AS course_realisation_id,
          course_realisations.name AS course_realisation_name,
          course_realisations.start_date AS course_realisation_start_date,
          course_realisations.end_date AS course_realisation_end_date,
          course_units.id AS course_unit_id,
          course_units.course_code AS course_code,
          course_units.name AS course_unit_name,
          CASE 
            WHEN feedback_targets.feedback_response IS NOT NULL AND char_length(feedback_targets.feedback_response) > 0 THEN TRUE
            ELSE FALSE
          END AS feedback_response_given
        FROM
          user_feedback_targets
          INNER JOIN (
            ${FEEDBACKS_QUERY}
          ) feedbacks_3 ON user_feedback_targets.feedback_id = feedbacks_3.id
          INNER JOIN feedback_targets ON feedback_targets.id = user_feedback_targets.feedback_target_id
          INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
          INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
        WHERE
          feedback_targets.feedback_type = 'courseRealisation'
          AND course_units.id = :courseUnitId
          AND feedbacks_3.question_id IN (:questionIds)
          AND user_feedback_targets.access_status = 'STUDENT'
          AND course_realisations.start_date < NOW()
      ) feedbacks_4
  ) feedbacks_5
WHERE
  course_realisation_index <= 20;
`

const getFeedbackMean = (rows) => {
  const values = rows.map((row) => row.int_question_data).filter((v) => v !== 0)

  return values.length > 0 ? _.round(_.mean(values), 2) : null
}

const getFeedbackCount = (rows) =>
  _.uniq(rows.map((row) => row.feedback_id)).length

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

  const feedbackCount = getFeedbackCount(rows)

  return {
    results,
    feedbackCount,
  }
}

const getCourseUnitsWithResults = (rows, questionIds) => {
  const rowsByCourseUnitId = _.groupBy(rows, (row) => row.course_unit_id)

  const courseUnits = Object.entries(rowsByCourseUnitId).map(
    ([courseUnitId, courseUnitRows]) => {
      const {
        course_unit_name: name,
        course_code: courseCode,
      } = courseUnitRows[0]

      const { previous = [], current = [] } = _.groupBy(courseUnitRows, (row) =>
        row.course_realisation_index === '1' ? 'current' : 'previous',
      )

      const feedbackResponseGiven = Boolean(current[0]?.feedback_response_given)

      const { results, feedbackCount } = getResults(current, questionIds)

      const {
        results: previousResults,
        feedbackCount: previousFeedbackCount,
      } = getResults(previous, questionIds)

      return {
        id: courseUnitId,
        name,
        courseCode,
        results,
        previousResults,
        feedbackCount,
        previousFeedbackCount,
        feedbackResponseGiven,
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

      const { results, feedbackCount } = getResults(
        organisationRows,
        questionIds,
      )

      return {
        id: organisationId,
        name,
        code,
        results,
        feedbackCount,
        courseUnits: getCourseUnitsWithResults(organisationRows, questionIds),
      }
    },
  )

  return _.orderBy(organisations, ['code'])
}

const getOrganisationSummaries = async ({ questionIds, courseCodes }) => {
  const rows = await sequelize.query(ORGANISATION_SUMMARY_QUERY, {
    replacements: {
      questionIds: questionIds.map((id) => id.toString()),
      courseCodes,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  return getOrganisationsWithResults(rows, questionIds)
}

const getCourseRealisationsWithResults = (rows, questionIds) => {
  const rowsByCourseRealisationId = _.groupBy(
    rows,
    (row) => row.course_realisation_id,
  )

  const coruseRealisations = Object.entries(rowsByCourseRealisationId).map(
    ([courseRealisationId, courseRealisationRows]) => {
      const {
        course_realisation_name: name,
        course_realisation_start_date: startDate,
        course_realisation_end_date: endDate,
        feedback_response_given: feedbackResponseGiven,
        course_code: courseCode,
        feedback_target_id: feedbackTargetId,
      } = courseRealisationRows[0]

      const { results, feedbackCount } = getResults(
        courseRealisationRows,
        questionIds,
      )

      return {
        courseCode,
        id: courseRealisationId,
        name,
        startDate,
        endDate,
        results,
        feedbackCount,
        feedbackResponseGiven,
        feedbackTargetId,
      }
    },
  )

  return _.orderBy(coruseRealisations, ['startDate'], ['desc'])
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
