const _ = require('lodash')
const datefns = require('date-fns')
const { WORKLOAD_QUESTION_ID_ORDER, WORKLOAD_QUESTION_ID } = require('../../util/config')
const { Summary } = require('../../models')

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

const subtractSummary = (summary1, summary2) => {
  if (summary1.startDate !== summary2.startDate || summary1.endDate !== summary2.endDate) {
    throw new Error('Subtract summaries with different start or end dates is not allowed')
  }

  const data1 = summary1.data
  const data2 = summary2.data

  const data = {
    result: {},
    studentCount: data1.studentCount - data2.studentCount,
    hiddenCount: data1.hiddenCount - data2.hiddenCount,
    feedbackCount: data1.feedbackCount - data2.feedbackCount,
    feedbackResponsePercentage: data1.feedbackResponsePercentage - data2.feedbackResponsePercentage,
  }

  for (const questionId of Object.keys(data1.result)) {
    data.result[questionId] = sumQuestionResults(
      [
        data1.result[questionId],
        {
          distribution: Object.fromEntries(
            Object.entries(data2.result[questionId].distribution).map(([optionId, count]) => [optionId, -count])
          ),
        },
      ],
      questionId
    )
  }

  return {
    startDate: summary1.startDate,
    endDate: summary1.endDate,
    data,
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

  // De-duplicate input by entityId + startDate + endDate + extraOrgIds
  const deduplicatedSummaries = _.uniqBy(
    summaries,
    s => `${s.entityId}:${s.startDate}:${s.endDate}:${s.extraOrgIds ? s.extraOrgIds.join('+') : ''}`
  )
  //remove those summaries which have startDate and endDate between other summaries and se keyvalues
  const filteredSummaries = deduplicatedSummaries.filter(s => {
    return !deduplicatedSummaries.some(s2 => {
      const key1 = `${s.entityId}:${s.extraOrgIds ? s.extraOrgIds.join('+') : ''}`
      const key2 = `${s2.entityId}:${s2.extraOrgIds ? s2.extraOrgIds.join('+') : ''}`

      const timespan1 = `${s.startDate}:${s.endDate}`
      const timespan2 = `${s2.startDate}:${s2.endDate}`

      return (
        datefns.isWithinInterval(datefns.parseISO(s.startDate), {
          start: datefns.parseISO(s2.startDate),
          end: datefns.parseISO(s2.endDate),
        }) &&
        datefns.isWithinInterval(datefns.parseISO(s.endDate), {
          start: datefns.parseISO(s2.startDate),
          end: datefns.parseISO(s2.endDate),
        }) &&
        key1 === key2 &&
        timespan1 !== timespan2
      )
    })
  })

  const data = sumSummaryDatas(filteredSummaries.map(s => s.data))
  const startDate = datefns.format(datefns.min(filteredSummaries.map(s => datefns.parseISO(s.startDate))), 'yyyy-MM-dd')
  const endDate = datefns.format(datefns.max(filteredSummaries.map(s => datefns.parseISO(s.endDate))), 'yyyy-MM-dd')
  const summary = filteredSummaries[0]
  summary.data = data
  summary.startDate = startDate
  summary.endDate = endDate

  return summary
}

const getScopedSummary = ({ startDate, endDate, extraOrgId, extraOrgMode, allTime }) => {
  const scopes = allTime ? [] : [{ method: ['at', startDate, endDate] }]

  if (extraOrgId) {
    if (extraOrgMode === 'exclude') {
      scopes.push({ method: ['noExtraOrg', extraOrgId] })
    }
    if (extraOrgMode === 'only') {
      scopes.push({ method: ['extraOrg', extraOrgId] })
    }
  }
  return Summary.scope(scopes)
}

module.exports = {
  sumSummaryDatas,
  mapOptionIdToValue,
  sumSummaries,
  subtractSummary,
  getScopedSummary,
}
