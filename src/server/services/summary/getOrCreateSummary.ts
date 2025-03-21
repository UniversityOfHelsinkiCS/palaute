import { Summary, UserFeedbackTarget } from '../../models'
import { createSummaryForFeedbackTarget } from './createSummary'

export const getOrCreateSummary = async (feedbackTargetId: number) => {
  let summary = await Summary.findOne({
    where: { feedbackTargetId },
  })

  if (!summary) {
    const studentCount = await UserFeedbackTarget.count({
      where: { feedbackTargetId, accessStatus: 'STUDENT' },
    })
    summary = await createSummaryForFeedbackTarget(feedbackTargetId, studentCount, new Date(), new Date())
  }

  return summary
}
