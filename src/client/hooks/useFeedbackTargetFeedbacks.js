import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useFeedbackTargetFeedbacks = (targetId, groupId, options = {}) => {
  const queryKey = ['feedbackTargetFeedbacks', targetId, groupId]

  const queryFn = async () => {
    const urlQueryString = groupId !== 'ALL' ? `?groupId=${groupId}` : ''
    const { data } = await apiClient.get(`/feedback-targets/${targetId}/feedbacks${urlQueryString}`)

    return data
  }

  const { data: feedbackTargetData, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId),
    refetchOnFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    keepPreviousData: true,
    ...options,
  })

  return { feedbackTargetData, ...rest }
}

export default useFeedbackTargetFeedbacks
