import _ from 'lodash'
import * as datefns from 'date-fns'
import { WORKLOAD_QUESTION_ID_ORDER, WORKLOAD_QUESTION_ID } from '../../util/config'
import { Summary } from '../../models'
import { SummaryData, SummaryResult } from '../../models/summary'

const mapOptionIdToValue = (optionId: string, questionId: string) => {
  if (Number(questionId) === WORKLOAD_QUESTION_ID) {
    return WORKLOAD_QUESTION_ID_ORDER.indexOf(optionId) + 1
  }
  return Number(optionId)
}

const sumQuestionResults = (results: SummaryResult[], questionId: string) => {
  const distribution: Record<string, number> = {}

  for (const result of results) {
    Object.entries(result.distribution).forEach(([optionId, count]: [string, number]) => {
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

const sumSummaryDatas = (summaryDatas: SummaryData[]) => {
  const data: SummaryData = {
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

const sumSummaries = (summaries: Summary[]) => {
  if (!summaries?.length) {
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

const getScopedSummary = ({
  startDate,
  endDate,
  extraOrgId,
  extraOrgMode,
  allTime,
}: {
  startDate: string
  endDate: string
  extraOrgId?: string
  extraOrgMode?: string
  allTime?: boolean
}) => {
  const scopes: any = allTime ? [] : [{ method: ['at', startDate, endDate] }]

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

export { sumSummaryDatas, mapOptionIdToValue, sumSummaries, getScopedSummary }
