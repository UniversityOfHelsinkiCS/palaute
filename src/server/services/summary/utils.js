const _ = require('lodash')
const datefns = require('date-fns')
const { WORKLOAD_QUESTION_ID_ORDER, WORKLOAD_QUESTION_ID } = require('../../util/config')

const mapOptionIdToValue = (optionId, questionId) => {
  if (Number(questionId) === WORKLOAD_QUESTION_ID) {
    return WORKLOAD_QUESTION_ID_ORDER.indexOf(optionId) + 1
  }
  return Number(optionId)
}

const sumQuestionResults = (results, questionId) => {
  const distribution = {}

  for (const result of results) {
    Object.entries(result.distribution).forEach(([optionId, count]) => {
      distribution[optionId] = (distribution[optionId] ?? 0) + count
    })
  }

  let totalValue = 0
  let totalAnsweredCount = 0
  Object.entries(distribution).forEach(([optionId, count]) => {
    if (Number(optionId) !== 0) {
      totalValue += count * mapOptionIdToValue(optionId, questionId)
      totalAnsweredCount += count
    }
  })

  return {
    mean: totalAnsweredCount > 0 ? totalValue / totalAnsweredCount : 0,
    distribution,
  }
}

const sumSummaryDatas = summaryDatas => {
  const data = {
    result: {},
    studentCount: 0,
    hiddenCount: 0,
    feedbackCount: 0,
    feedbackResponsePercentage: 0,
  }

  for (const summaryData of summaryDatas) {
    data.studentCount += summaryData.studentCount
    data.hiddenCount += summaryData.hiddenCount
    data.feedbackCount += summaryData.feedbackCount
    data.feedbackResponsePercentage += summaryData.feedbackResponsePercentage

    for (const questionId of Object.keys(summaryData.result)) {
      if (!data.result[questionId]) {
        data.result[questionId] = {
          mean: 0,
          distribution: {},
        }
      }

      data.result[questionId] = sumQuestionResults(
        [data.result[questionId], summaryData.result[questionId]],
        questionId
      )
    }
  }

  data.feedbackResponsePercentage /= summaryDatas.length

  return data
}

const sumSummaries = summaries => {
  if (!summaries?.length > 0) {
    return null
  }
  const data = sumSummaryDatas(summaries.map(s => s.data))
  const startDate = datefns.min(summaries.map(s => datefns.parseISO(s.startDate)))
  const endDate = datefns.max(summaries.map(s => datefns.parseISO(s.endDate)))
  const summary = summaries[0]
  summary.data = data
  summary.startDate = startDate
  summary.endDate = endDate

  return summary
}

const getLikertMean = distribution => {
  const entries = [
    distribution['1'] || 0,
    distribution['2'] || 0,
    distribution['3'] || 0,
    distribution['4'] || 0,
    distribution['5'] || 0,
  ]

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

  if (totalCount === 0) return 0

  let sum = 0
  for (let i = 0; i < entries.length; i++) {
    const count = entries[i]
    const value = i + 1
    sum += value * count
  }

  return _.round(sum / totalCount, 2)
}

/**
 * Only used for WORKLOAD questions
 * @param {*} distribution
 * @param {*} question
 * @returns
 */
const getSingleChoiceMean = (distribution, question) => {
  const entries = []

  for (let i = 0; i < question.data.options.length; i++) {
    const optionId = question.data.options[i].id
    entries.push(distribution[optionId] || 0)
  }

  // hack to convert possible strings to numbers when doing math
  const totalCount = -(-entries[0] - entries[1] - entries[2] - entries[3] - entries[4])

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

module.exports = {
  getMean,
  sumSummaryDatas,
  mapOptionIdToValue,
  sumSummaries,
}
