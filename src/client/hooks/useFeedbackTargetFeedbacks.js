import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargetFeedbacks = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetFeedbacks', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/feedback-targets/${targetId}/feedbacks`,
    )

    return data
  }

  const { data: feedbacks, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbacks, ...rest }
}

export default useFeedbackTargetFeedbacks
