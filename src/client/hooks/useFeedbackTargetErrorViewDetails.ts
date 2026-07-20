import { useQuery } from '@tanstack/react-query'
import type { GetFeedbackTargetErrorViewDetailsResponse } from '@common/types/feedbackTarget'

import apiClient from '../util/apiClient'

const queryKey = ['feedbackTargetErrorViewDetails']

export const useFeedbackTargetErrorViewDetails = (feedbackTargetId: number | string, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get<GetFeedbackTargetErrorViewDetailsResponse>(
      `/feedback-targets/${feedbackTargetId}/error-view-details`
    )

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery({
    queryKey: [queryKey, feedbackTargetId],
    queryFn,
    enabled: enable,
  })

  return { feedbackTarget, ...rest }
}
