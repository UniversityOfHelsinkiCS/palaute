import type { GetFeedbackTargetFeedbacksResponse } from '@common/types/feedbackTarget'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargetFeedbacks = (
  targetId: number | string,
  groupId: string,
  options: Partial<UseQueryOptions<GetFeedbackTargetFeedbacksResponse>> = {}
) => {
  const queryKey = ['feedbackTargetFeedbacks', targetId, groupId]

  const queryFn = async () => {
    const urlQueryString = groupId !== 'ALL' ? `?groupId=${groupId}` : ''
    const { data } = await apiClient.get<GetFeedbackTargetFeedbacksResponse>(
      `/feedback-targets/${targetId}/feedbacks${urlQueryString}`
    )

    return data
  }

  const { data: feedbackTargetData, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    ...options,
  })

  return { feedbackTargetData, ...rest }
}

export default useFeedbackTargetFeedbacks
