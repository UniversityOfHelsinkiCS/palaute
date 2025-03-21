import { Summary } from '../../models'
import { feedbackTargetCache } from '../feedbackTargets'
import { getOrCreateSummary } from './getOrCreateSummary'

export const updateSummaryAfterFeedbackResponseCreated = async (feedbackTargetId: number) => {
  const summary = await getOrCreateSummary(feedbackTargetId)

  summary.data.feedbackResponsePercentage = 1

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  // Because sequelize is soo "optimized", we need to manually mark the field as changed
  await Summary.update({ data: summary.data }, { where: { feedbackTargetId } })
}

export const updateSummaryAfterFeedbackResponseDeleted = async (feedbackTargetId: number) => {
  const summary = await getOrCreateSummary(feedbackTargetId)

  summary.data.feedbackResponsePercentage = 0

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  // Because sequelize is soo "optimized", we need to manually mark the field as changed
  await Summary.update({ data: summary.data }, { where: { feedbackTargetId } })
}
