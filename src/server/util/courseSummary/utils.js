const _ = require('lodash')

const QUESTION_AVERAGES_QUERY = `
SELECT
  feedback_target_id,
  question_id,
  question_data,
  COUNT(question_data) AS question_data_count
  FROM
  (
    SELECT
    --feedback_id,
    feedback_target_id,
    question_id,
    question_data
    FROM
    user_feedback_targets
    INNER JOIN (
      SELECT
      id,
      answer::jsonb->>'questionId' AS question_id,
      answer::jsonb->>'data' AS question_data
      FROM
      (
        SELECT
        id,
        --user_id,
        jsonb_array_elements_text(data) AS answer
        FROM
        feedbacks  
      ) feedbacks_1
      WHERE 
      answer::jsonb->>'questionId' IN (:questionIds)
      AND answer::jsonb->>'data' IN (:validDataValues)
    ) feedbacks_2 ON user_feedback_targets.feedback_id = feedbacks_2.id
    WHERE
    user_feedback_targets.access_status = 'STUDENT'
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

const getValidDataValues = (questions) => {
  const singleChoiceValues = questions
    .filter((q) => q.type === 'SINGLE_CHOICE')
    .flatMap((q) => q.data?.options ?? [])
    .map((o) => o.id)
    .filter(Boolean)

  const likertValues = ['0', '1', '2', '3', '4', '5']

  return [...singleChoiceValues, ...likertValues]
}

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

  return {
    feedbackCount: _.sumBy(uniqueFeedbackTargets, (row) =>
      parseInt(row.feedback_count, 10),
    ),
    studentCount: _.sumBy(uniqueFeedbackTargets, (row) =>
      parseInt(row.student_count, 10),
    ),
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

module.exports = {
  QUESTION_AVERAGES_QUERY,
  COUNTS_QUERY,
  getValidDataValues,
  getResults,
  getCounts,
}
