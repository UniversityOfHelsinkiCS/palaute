import { FeedbackTarget, Summary } from '../../models'

export const createSummaryForFeedbackTarget = async (
  feedbackTarget: FeedbackTarget,
  initialStudentCount: number,
  startDate: Date,
  endDate: Date,
  extraOrgIds: string[] = []
): Promise<Summary> => {
  const summary = await Summary.create({
    // @ts-expect-error fbt is not yet typescripted
    entityId: feedbackTarget.id,
    entityType: 'feedbackTarget',
    // @ts-expect-error fbt is not yet typescripted
    feedbackTargetId: feedbackTarget.id,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
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
