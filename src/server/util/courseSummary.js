const _ = require('lodash')
const { Op } = require('sequelize')

const { sequelize } = require('./dbConnection')
const { FeedbackTarget, UserFeedbackTarget, User } = require('../models')

const QUESTION_AVERAGES_QUERY = `
SELECT
  feedback_target_id,
  question_id,
  question_data,
  COUNT(question_data) AS question_data_count
FROM
  (
    SELECT
      feedback_id,
      feedback_target_id,
      question_id,
      question_data
    FROM
      user_feedback_targets
      INNER JOIN (
        SELECT
          id,
          question_feedback::jsonb->>'questionId' AS question_id,
          question_feedback::jsonb->>'data' AS question_data
        FROM
          (
            SELECT
              id,
              user_id,
              jsonb_array_elements_text(data) AS question_feedback
            FROM
              feedbacks
          ) feedbacks_1
      ) feedbacks_2 ON user_feedback_targets.feedback_id = feedbacks_2.id
    WHERE
      user_feedback_targets.access_status = 'STUDENT'
      AND feedbacks_2.question_id IN (:questionIds)
      AND feedbacks_2.question_data IN (:validDataValues)
  ) as feedbacks_3
GROUP BY
  feedback_target_id,
  question_id,
  question_data
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
  AND (organisations.id IN (:organisationIds) OR course_realisations.id IN (:accessibleCourseRealisationIds))
  AND course_units.course_code NOT IN (:disabledCourseCodes)
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '48 months';
`

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
  AND course_units.course_code = :courseCode
  AND course_realisations.start_date < NOW()
  AND course_realisations.start_date > NOW() - interval '72 months';
`

const getFeedbackDistribution = (rows) => {
  const grouped = _.groupBy(rows, (row) => row.question_data)

  return _.mapValues(grouped, (rows) =>
    _.sumBy(rows, (row) => parseInt(row.question_data_count, 10)),
  )
}

const getLikertMean = (distribution) => {
  const entries = Object.entries(
    _.pick(distribution, ['1', '2', '3', '4', '5']),
  )

  if (entries.length === 0) {
    return 0
  }

  const totalCount = _.sumBy(entries, ([, count]) => parseInt(count, 10))

  const sum = _.sumBy(
    entries,
    ([value, count]) => parseInt(value, 10) * parseInt(count, 10),
  )

  return _.round(sum / totalCount, 2)
}

const getSingleChoiceMean = (distribution, question) => {
  const options = question.data?.options ?? []
  const optionIds = options.map(({ id }) => id)

  const entries = Object.entries(_.pick(distribution, optionIds))

  if (entries.length === 0) {
    return 0
  }

  const indexByOptionId = optionIds.reduce(
    (acc, id, index) => ({
      ...acc,
      [id]: index + 1,
    }),
    {},
  )

  const totalCount = _.sumBy(entries, ([, count]) => parseInt(count, 10))

  const sum = _.sumBy(
    entries,
    ([value, count]) => indexByOptionId[value] * parseInt(count, 10),
  )

  return _.round(sum / totalCount, 2)
}

const getMean = (distribution, question) => {
  switch (question.type) {
    case 'LIKERT':
      return getLikertMean(distribution)
    case 'SINGLE_CHOICE':
      return getSingleChoiceMean(distribution, question)
    default:
      return 0
  }
}

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

const getResults = (rows, questions) => {
  const rowsByQuestionId = _.groupBy(rows, (row) => row.question_id.toString())

  const results = questions.map((question) => {
    const questionRows = rowsByQuestionId[question.id.toString()] ?? []
    const distribution = getFeedbackDistribution(questionRows)

    return {
      questionId: question.id,
      mean: getMean(distribution, question),
      distribution,
    }
  })

  return results
}

const getCourseUnitsWithResults = (rows, questions) => {
  const rowsByCourseCode = _.groupBy(rows, (row) => row.course_code)

  const courseUnits = Object.entries(rowsByCourseCode).map(
    ([courseCode, courseUnitRows]) => {
      const { course_unit_name: name, closes_at: closesAt } = courseUnitRows[0]

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

  return _.orderBy(courseUnits, ['courseCode'])
}

const getOrganisationsWithResults = (rows, questions) => {
  const rowsByOrganisationId = _.groupBy(rows, (row) => row.organisation_id)

  const organisations = Object.entries(rowsByOrganisationId).map(
    ([organisationId, organisationRows]) => {
      const { organisation_name: name, organisation_code: code } =
        organisationRows[0]

      const courseUnits = getCourseUnitsWithResults(organisationRows, questions)

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
      }
    },
  )

  return _.orderBy(courseRealisations, ['startDate'], ['desc'])
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

const getValidDataValues = (questions) => {
  const singleChoiceValues = questions
    .filter((q) => q.type === 'SINGLE_CHOICE')
    .flatMap((q) => q.data?.options ?? [])
    .map((o) => o.id)
    .filter(Boolean)

  const likertValues = ['0', '1', '2', '3', '4', '5']

  return [...singleChoiceValues, ...likertValues]
}

const getOrganisationSummaries = async ({
  questions,
  organisationAccess,
  accessibleCourseRealisationIds,
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

  return withMissingOrganisations(
    getOrganisationsWithResults(rows, questions),
    organisationAccess,
    questions,
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
        include: [{ model: User, as: 'user', required: true }],
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
  getOrganisationSummaries,
  getCourseRealisationSummaries,
}
