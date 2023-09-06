const { WORKLOAD_QUESTION_ID_ORDER, WORKLOAD_QUESTION_ID } = require('../../util/config')

const mapOptionIdToValue = (optionId, questionId) => {
  if (questionId === WORKLOAD_QUESTION_ID) {
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

module.exports = {
  sumSummaryDatas,
  mapOptionIdToValue,
}
