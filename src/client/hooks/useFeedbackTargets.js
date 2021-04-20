import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargets = (courseUnitId, options) => {
  const queryKey = ['feedbackTargets', courseUnitId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-units/${courseUnitId}/feedback-targets`,
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
