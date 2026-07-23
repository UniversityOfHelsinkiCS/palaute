import type { GetFeedbackTargetResponse } from '@common/types/feedbackTarget'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useFeedbackTarget = (
  targetId: number | string,
  options: Partial<UseQueryOptions<GetFeedbackTargetResponse>> = {}
) => {
  const queryKey = ['feedbackTarget', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetFeedbackTargetResponse>(`/feedback-targets/${targetId}`)

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbackTarget, ...rest }
}

export default useFeedbackTarget
