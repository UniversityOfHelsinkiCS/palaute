import type { GetFeedbackTargetLogsResponse } from '@common/types/feedbackTarget'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useFeedbackTargetLogs = (
  id: number | string,
  options: Partial<UseQueryOptions<GetFeedbackTargetLogsResponse>> = {}
) => {
  const queryKey = ['feedbackTargetLogs', id]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetFeedbackTargetLogsResponse>(`/feedback-targets/${id}/logs`)

    return data
  }

  const { data: feedbackTargetLogs, ...rest } = useQuery({
    queryKey,
    queryFn,
    gcTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { feedbackTargetLogs, ...rest }
}

export default useFeedbackTargetLogs
