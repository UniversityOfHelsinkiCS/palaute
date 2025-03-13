import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useFeedbackTargetLogs = (id, options = {}) => {
  const queryKey = ['feedbackTargetLogs', id]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${id}/logs`)

    return data
  }

  const { data: feedbackTargetLogs, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { feedbackTargetLogs, ...rest }
}

export default useFeedbackTargetLogs
