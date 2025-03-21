import { feedbackTargetCache } from '../feedbackTargets'
import { Feedback, Summary, UserFeedbackTarget } from '../../models'
import { addFeedbackDataToSummary, removeFeedbackDataFromSummary } from './utils'
import { createSummaryForFeedbackTarget } from './createSummary'
import { getOrCreateSummary } from './getOrCreateSummary'

export const updateSummaryAfterFeedbackCreated = async (feedbackTargetId: number, feedback: Feedback) => {
  let summary = await Summary.findOne({
    where: { feedbackTargetId },
  })

  const acualStudentCount = await UserFeedbackTarget.count({
    where: { feedbackTargetId, accessStatus: 'STUDENT' },
  })

  if (!summary) {
    summary = await createSummaryForFeedbackTarget(feedbackTargetId, acualStudentCount, new Date(), new Date())
  }

  summary.data = addFeedbackDataToSummary(summary.data, feedback.data)
  summary.data.studentCount = acualStudentCount

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  // Because sequelize is soo "optimized", we need to manually mark the field as changed
  await Summary.update({ data: summary.data }, { where: { feedbackTargetId } })
}

export const updateSummaryAfterFeedbackDestroyed = async (feedbackTargetId: number, feedback: Feedback) => {
  const summary = await getOrCreateSummary(feedbackTargetId)

  summary.data = removeFeedbackDataFromSummary(summary.data, feedback.data)

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  await Summary.update({ data: summary.data }, { where: { feedbackTargetId } })
}
