const _ = require('lodash')
const { Survey } = require('../../models')

const WORKLOAD_QUESTION_ID = 1042

const QUESTION_AVERAGES_QUERY = `
SELECT
  feedback_target_id,
  question_id,
  question_data,
  COUNT(question_data) AS question_data_count
FROM
(
  SELECT
    feedback_target_id,
    question_id,
    question_data
  FROM
    user_feedback_targets
  INNER JOIN (
    SELECT
      id,
      answer->>'questionId' AS question_id,
      answer->>'data' AS question_data
    FROM
    (
      SELECT
      id,
      jsonb_array_elements(data) AS answer
      FROM
      feedbacks  
    ) feedbacks_1
    WHERE 
      answer->>'questionId' IN (:questionIds)
      AND answer->>'data' IN (:validDataValues)
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
  COUNT(*) AS student_count
  --COUNT(feedback_id) AS feedback_count
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

const getFeedbackDistribution = (rows) => {
  const grouped = _.groupBy(rows, (row) => row.question_data)

  return _.mapValues(grouped, (rows) =>
    _.sumBy(rows, (row) => parseInt(row.question_data_count, 10)),
  )
}

const getLikertMean = (distribution) => {
  const entries = [
    distribution['1'] || 0,
    distribution['2'] || 0,
    distribution['3'] || 0,
    distribution['4'] || 0,
    distribution['5'] || 0,
  ]

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(
    -entries[0] -
    entries[1] -
    entries[2] -
    entries[3] -
    entries[4]
  )

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return _.round(sum / totalCount, 2)
}

const getSingleChoiceMean = (distribution, question) => {
  const entries = []

  for (let i = 0; i < question.data.options.length; i++) {
    const optionId = question.data.options[i].id
    entries.push(distribution[optionId] || 0)
  }

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(
    -entries[0] -
    entries[1] -
    entries[2] -
    entries[3] -
    entries[4]
  )

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

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
  getUniversityQuestions,
  getMean,
}
