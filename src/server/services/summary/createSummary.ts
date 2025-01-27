import { formatActivityPeriod } from '../../util/common'
import { Summary } from '../../models'

export const createSummaryForFeedbackTarget = async (
  feedbackTargetId: number,
  initialStudentCount: number,
  startDate: Date,
  endDate: Date,
  extraOrgIds: string[] = []
): Promise<Summary> => {
  const activityPeriod = formatActivityPeriod({ startDate, endDate })
  const summary = await Summary.create({
    entityId: String(feedbackTargetId),
    entityType: 'feedbackTarget',
    feedbackTargetId,
    startDate: activityPeriod.startDate.toISOString(),
    endDate: activityPeriod.endDate.toISOString(),
    extraOrgIds,
    data: {
      feedbackCount: 0,
      studentCount: initialStudentCount,
      hiddenCount: 0,
      feedbackResponsePercentage: 0,
      result: {},
    },
  })

  return summary
}
