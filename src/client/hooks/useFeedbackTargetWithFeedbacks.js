import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargetWithFeedbacks = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetWithFeedbacks', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/feedback-targets/with-feedbacks/${targetId}`,
    )

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbackTarget, ...rest }
}

export default useFeedbackTargetWithFeedbacks
