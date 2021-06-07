const _ = require('lodash')

const { sequelize } = require('./dbConnection')

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

const COURSE_UNITS_FOR_TEACHER_QUERY = `
WITH feedback_counts AS (
  ${COUNTS_QUERY}
)

SELECT
  *
FROM
  (
    SELECT
      feedback_count,
      student_count,
      course_units.id AS course_unit_id,
      course_units.name AS course_unit_name,
      course_units.validity_period AS validity_period,
      course_units.course_code AS course_code,
      feedback_targets.feedback_response AS feedback_response,
      feedback_targets.closes_at AS closes_at,
      feedback_targets.opens_at AS opens_at,
      feedback_targets.id AS feedback_target_id,
      user_feedback_targets.id AS user_feedback_targets_id,
      user_feedback_targets.user_id AS user_feedback_targets_user_id,
      course_realisations.start_date AS start_date,
      course_realisations.end_date AS end_date,
      CASE
        WHEN feedback_targets.feedback_response IS NOT NULL
        AND char_length(feedback_targets.feedback_response) > 0 THEN TRUE
        ELSE FALSE
      END AS feedback_response_given
    FROM feedback_counts
      INNER JOIN feedback_targets ON feedback_counts.feedback_target_id = feedback_targets.id
      INNER JOIN user_feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
      INNER JOIN course_units ON feedback_targets.course_unit_id = course_units.id
      INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    WHERE
      feedback_targets.feedback_type = 'courseRealisation'
      AND user_feedback_targets.access_status = 'TEACHER'
      AND user_feedback_targets.user_id = (:userId)
  ) feedbacks
`

const parseCourseUnitsForTeacher = (rows) => {
  const couresUnitsById = _.groupBy(rows, (row) => row.course_unit_id)

  const courseUnits = Object.entries(couresUnitsById).map(
    ([courseUnitId, courseUnitRow]) => {
      const {
        feedback_count: feedbackCount,
        student_count: studentCount,
        course_unit_name: name,
        validity_period: validityPeriod,
        course_code: courseCode,
        feedback_response_given: feedbackResponseGiven,
        closes_at: closesAt,
        opens_at: opensAt,
        feedback_target_id: feedbackTargetId,
        start_date: startDate,
        end_date: endDate,
      } = courseUnitRow[0]

      return {
        id: courseUnitId,
        feedbackCount,
        studentCount,
        courseUnitId,
        name,
        validityPeriod,
        courseCode,
        feedbackResponseGiven,
        closesAt,
        opensAt,
        feedbackTargetId,
        activityPeriod: {
          startDate,
          endDate,
        },
      }
    },
  )

  return courseUnits
}

const getCourseUnitsForTeacherQuery = async (id) => {
  const rows = await sequelize.query(COURSE_UNITS_FOR_TEACHER_QUERY, {
    replacements: {
      userId: id,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  return parseCourseUnitsForTeacher(rows)
}

module.exports = {
  getCourseUnitsForTeacherQuery,
}
