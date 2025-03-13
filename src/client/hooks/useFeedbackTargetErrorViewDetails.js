import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const queryKey = ['feedbackTargetErrorViewDetails']

export const useFeedbackTargetErrorViewDetails = (feedbackTargetId, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${feedbackTargetId}/error-view-details`)

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery({
    queryKey: [queryKey, feedbackTargetId],
    queryFn,
  })

  return { feedbackTarget, rest }
}
