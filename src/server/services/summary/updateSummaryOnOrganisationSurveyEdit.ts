import feedbackTargetCache from '../feedbackTargets/feedbackTargetCache'
import { Summary } from '../../models'
import { getOrCreateSummary } from './getOrCreateSummary'

export const updateSummaryOnOrganisationSurveyEdit = async (feedbackTargetId: number, updatedStudentCount: number) => {
  const summary = await getOrCreateSummary(feedbackTargetId)

  summary.data.studentCount = updatedStudentCount

  const cachedFbt = await feedbackTargetCache.get(feedbackTargetId)
  if (cachedFbt) {
    cachedFbt.summary = summary
    await feedbackTargetCache.set(feedbackTargetId, cachedFbt)
  }

  await Summary.update(
    { data: summary.data },
    {
      where: {
        feedbackTargetId,
      },
    }
  )

  return summary
}
