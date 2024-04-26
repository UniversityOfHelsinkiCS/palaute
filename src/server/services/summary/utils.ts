import _ from 'lodash'
import datefns from 'date-fns'
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

  const data = sumSummaryDatas(deduplicatedSummaries.map(s => s.data))
  const startDate = datefns.format(
    datefns.min(deduplicatedSummaries.map(s => datefns.parseISO(s.startDate))),
    'yyyy-MM-dd'
  )
  const endDate = datefns.format(datefns.max(deduplicatedSummaries.map(s => datefns.parseISO(s.endDate))), 'yyyy-MM-dd')
  const summary = deduplicatedSummaries[0]
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
