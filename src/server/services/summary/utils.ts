import _ from 'lodash'
import * as datefns from 'date-fns'
import { FeedbackData } from 'models/feedback'
import { InferAttributes } from 'sequelize'
import { WORKLOAD_QUESTION_ID_ORDER, WORKLOAD_QUESTION_ID } from '../../util/config'
import { Summary, Organisation, CourseUnit, CourseRealisation } from '../../models'
import { SummaryData, SummaryResult } from '../../models/summary'

const mapOptionIdToValue = (optionId: string, questionId: string | number) => {
  if (Number(questionId) === WORKLOAD_QUESTION_ID) {
    return (WORKLOAD_QUESTION_ID_ORDER.indexOf(optionId) as number) + 1
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

  // Filter out invalid dates and summaries with overlapping time spans
  const filteredSummaries = deduplicatedSummaries.filter(s => {
    const isValidDateRange =
      datefns.isValid(datefns.parseISO(s.startDate)) && datefns.isValid(datefns.parseISO(s.endDate))

    if (!isValidDateRange) {
      return false
    }

    return (
      isValidDateRange &&
      !deduplicatedSummaries.some(s2 => {
        const key1 = `${s.entityId}:${s.extraOrgIds ? s.extraOrgIds.join('+') : ''}`
        const key2 = `${s2.entityId}:${s2.extraOrgIds ? s2.extraOrgIds.join('+') : ''}`

        const timespan1 = `${s.startDate}:${s.endDate}`
        const timespan2 = `${s2.startDate}:${s2.endDate}`

        if (!datefns.isValid(datefns.parseISO(s2.startDate)) || !datefns.isValid(datefns.parseISO(s2.endDate))) {
          return false
        }

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
    )
  })

  // If filteredSummaries is empty or has invalid dates, handle gracefully
  if (!filteredSummaries.length) return null

  // Sum up summary data
  const data = sumSummaryDatas(filteredSummaries.map(s => s.data))

  // Handle valid dates and avoid invalid time errors
  const validStartDates = filteredSummaries.map(s => datefns.parseISO(s.startDate)).filter(datefns.isValid)
  const validEndDates = filteredSummaries.map(s => datefns.parseISO(s.endDate)).filter(datefns.isValid)

  const startDate = datefns.format(datefns.min(validStartDates), 'yyyy-MM-dd')
  const endDate = datefns.format(datefns.max(validEndDates), 'yyyy-MM-dd')

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

/**
 * Adds new feedback data to the summary data.
 * Modifies the summary data in place and returns it.
 */
export const addFeedbackDataToSummary = (summaryData: SummaryData, feedbackData: FeedbackData) => {
  // Update summary question results based on the feedback data
  for (const { questionId, data: optionId } of feedbackData) {
    if (typeof optionId !== 'string') continue

    const optionValue = mapOptionIdToValue(optionId, questionId)

    // Make sure the value is not NaN
    if (!Number.isNaN(optionValue)) {
      let summaryResultForQuestion = summaryData.result[questionId]

      // Initialize the summary result for the question if it doesn't exist
      if (!summaryResultForQuestion) {
        summaryResultForQuestion = {
          mean: 0,
          distribution: {},
        }
        summaryData.result[questionId] = summaryResultForQuestion
      }

      // Increment the count for the option
      summaryResultForQuestion.distribution[optionId] = (summaryResultForQuestion.distribution[optionId] ?? 0) + 1

      // Calculate the new mean
      const oldSum = summaryResultForQuestion.mean * summaryData.feedbackCount
      const newSum = oldSum + optionValue
      summaryResultForQuestion.mean = newSum / (summaryData.feedbackCount + 1)
    }
  }

  // Increment the feedback count
  summaryData.feedbackCount += 1

  return summaryData
}

/**
 * Removes feedback data from the summary data.
 * Modifies the summary data in place and returns it.
 */
export const removeFeedbackDataFromSummary = (summaryData: SummaryData, feedbackData: FeedbackData) => {
  // Update summary question results based on the feedback data
  for (const { questionId, data: optionId } of feedbackData) {
    if (typeof optionId !== 'string') continue

    const summaryResultForQuestion = summaryData.result[questionId]

    const optionValue = mapOptionIdToValue(optionId, questionId)

    // Make sure the value is not NaN and the option exists in the summary
    if (summaryResultForQuestion && !Number.isNaN(optionValue)) {
      // Decrement the count for the option
      summaryResultForQuestion.distribution[optionId] = (summaryResultForQuestion.distribution[optionId] ?? 0) - 1
      // Remove the option if the count is zero (or below, which should not happen)
      if (summaryResultForQuestion.distribution[optionId] <= 0) {
        delete summaryResultForQuestion.distribution[optionId]
      }

      // Calculate the new mean
      const oldSum = summaryResultForQuestion.mean * summaryData.feedbackCount
      const newSum = oldSum - optionValue
      summaryResultForQuestion.mean = newSum / (summaryData.feedbackCount - 1)
    }
  }

  // Decrement the feedback count
  summaryData.feedbackCount -= 1

  return summaryData
}

const getOrganisationCodeById = async (organisationId: string) => {
  if (!organisationId) return undefined

  const organisationCode = await Organisation.findOne({
    attributes: ['code'],
    where: {
      id: organisationId,
    },
  })

  return organisationCode.code
}

const mapCourseIdsToCourseCodes = (
  teacherOrganisations: InferAttributes<Organisation>[],
  courseRealisations: CourseRealisation[]
) => {
  const curIdToCourseCodeMapping: Record<string, string> = {}
  const teacherOrgCUs = teacherOrganisations.flatMap(org => org.courseUnits)

  teacherOrgCUs.forEach(cu => {
    cu.courseRealisations.forEach((cur: CourseRealisation) => {
      curIdToCourseCodeMapping[cur.id] = cu.courseCode
    })
  })

  courseRealisations.forEach(cur => {
    cur.feedbackTargets.forEach(fbt => {
      curIdToCourseCodeMapping[cur.id] = fbt.courseUnit.courseCode
    })
  })

  return curIdToCourseCodeMapping
}

const getOrganisationCourseRealisationIds = (organisations: Organisation[], courseUnits: CourseUnit[]) =>
  organisations
    .flatMap(org => org.courseRealisationsOrganisations.map(curo => curo.courseRealisationId))
    .concat(courseUnits.flatMap(cu => cu.feedbackTargets.map(fbt => fbt.courseRealisationId)))

export {
  sumSummaryDatas,
  mapOptionIdToValue,
  sumSummaries,
  getScopedSummary,
  getOrganisationCodeById,
  mapCourseIdsToCourseCodes,
  getOrganisationCourseRealisationIds,
}
