import { feedbackTargetCache } from '../feedbackTargets'
import { Feedback, FeedbackTarget, Summary, UserFeedbackTarget } from '../../models'
import { addFeedbackDataToSummary, removeFeedbackDataFromSummary } from './utils'
import { createSummaryForFeedbackTarget } from './createSummary'

export const updateSummaryAfterFeedbackCreated = async (feedback: Feedback) => {
  const fbt = await FeedbackTarget.findOne({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { feedbackId: feedback.id },
      },
      {
        model: Summary,
        as: 'summary',
        required: false,
      },
    ],
  })

  //@ts-expect-error fbt is not yet typescripted
  let summary = fbt?.summary as Summary

  if (!summary) {
    const studentCount = await UserFeedbackTarget.count({
      //@ts-expect-error fbt is not yet typescripted
      where: { feedbackTargetId: fbt.id, accessStatus: 'STUDENT' },
    })
    //@ts-expect-error fbt is not yet typescripted
    summary = await createSummaryForFeedbackTarget(fbt.id, studentCount, new Date(), new Date())
  }

  summary.data = addFeedbackDataToSummary(summary.data, feedback.data)

  //@ts-expect-error fbt is not yet typescripted
  const cachedFbt = await feedbackTargetCache.get(fbt.id)
  if (cachedFbt) {
    cachedFbt.summary = summary
    //@ts-expect-error fbt is not yet typescripted
    await feedbackTargetCache.set(fbt.id, cachedFbt)
  }

  // Because sequelize is soo "optimized", we need to manually mark the field as changed
  //@ts-expect-error fbt is not yet typescripted
  await Summary.update({ data: summary.data }, { where: { feedbackTargetId: fbt.id } })
}

export const updateSummaryAfterFeedbackDestroyed = async (feedbackTargetId: number, feedback: Feedback) => {
  let summary = await Summary.findOne({
    where: { feedbackTargetId },
  })

  if (!summary) {
    const studentCount = await UserFeedbackTarget.count({
      //@ts-expect-error fbt is not yet typescripted
      where: { feedbackTargetId: fbt.id, accessStatus: 'STUDENT' },
    })
    //@ts-expect-error fbt is not yet typescripted
    summary = await createSummaryForFeedbackTarget(fbt.id, studentCount, new Date(), new Date())
  }

  summary.data = removeFeedbackDataFromSummary(summary.data, feedback.data)

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  await Summary.update({ data: summary.data }, { where: { feedbackTargetId } })
}
