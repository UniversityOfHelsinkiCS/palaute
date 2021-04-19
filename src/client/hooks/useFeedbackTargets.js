import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargets = (targetId, options) => {
  const queryKey = ['feedbackTarget', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-units/${targetId}/feedback-targets`,
    )

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery(
    queryKey,
    queryFn,
    options,
  )

  return { feedbackTargets, ...rest }
}

export default useFeedbackTargets
