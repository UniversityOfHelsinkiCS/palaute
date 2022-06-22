const _ = require('lodash')
const { Op } = require('sequelize')

const { sequelize } = require('../dbConnection')
const { FeedbackTarget, UserFeedbackTarget, User } = require('../../models')
const languages = require('../languages.json')

const {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
} = require('./utils')

const COURSE_REALISATION_SUMMARY_QUERY = `
WITH question_averages AS (
  ${QUESTION_AVERAGES_QUERY}
), feedback_counts AS (
  ${COUNTS_QUERY}
)

SELECT
  question_id,
  question_data,
  question_data_count,
  feedback_counts.feedback_count as feedback_count,
  student_count,
  feedback_targets.id AS feedback_target_id,
  feedback_targets.closes_at AS closes_at,
  course_realisations.id AS course_realisation_id,
  course_realisations.name AS course_realisation_name,
  course_realisations.start_date AS course_realisation_start_date,
  course_realisations.end_date AS course_realisation_end_date,
  course_units.course_code AS course_code,
  course_realisations.teaching_languages as teaching_languages,
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
  AND course_units.course_code = :courseCode
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '72 months';
`

const getLanguageNames = (teachingLanguages) =>
  teachingLanguages?.map(
    (languageCode) => languages[languageCode]?.name || languageCode,
  ) || []

const getCourseRealisationsWithResults = (rows, questions) => {
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
        teaching_languages: teachingLanguages,
      } = courseRealisationRows[0]

      const results = getResults(courseRealisationRows, questions)

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
        teachingLanguages: getLanguageNames(teachingLanguages),
      }
    },
  )

  return _.orderBy(
    courseRealisations,
    ['startDate', 'feedbackCount'],
    ['desc', 'desc'],
  )
}

const getCourseRealisationSummaries = async ({ courseCode, questions }) => {
  const validDataValues = getValidDataValues(questions)

  const rows = await sequelize.query(COURSE_REALISATION_SUMMARY_QUERY, {
    replacements: {
      questionIds: questions.map(({ id }) => id.toString()),
      courseCode,
      validDataValues,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  const courseRealisationsWithResults = getCourseRealisationsWithResults(
    rows,
    questions,
  )

  if (courseRealisationsWithResults.length === 0) {
    return []
  }

  const feedbackTargetIds = courseRealisationsWithResults.map(
    ({ feedbackTargetId }) => feedbackTargetId,
  )

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      id: {
        [Op.in]: feedbackTargetIds,
      },
    },
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: { accessStatus: 'TEACHER' },
        required: true,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'user',
            required: true,
          },
        ],
      },
    ],
  })

  const courseRealisationsWithTeachers = courseRealisationsWithResults.map(
    ({ feedbackTargetId, ...courseRealisation }) => {
      const feedbackTarget = feedbackTargets.find(
        ({ id }) => id === feedbackTargetId,
      )

      const teachers =
        feedbackTarget?.userFeedbackTargets.map(({ user }) => user) ?? []

      return {
        teachers,
        feedbackTargetId,
        ...courseRealisation,
      }
    },
  )

  return courseRealisationsWithTeachers
}

module.exports = {
  getCourseRealisationSummaries,
}
