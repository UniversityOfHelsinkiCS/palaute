import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargetSurveys = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetSurveys', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/feedback-targets/${targetId}/surveys`,
    )

    return data
  }

  const { data: surveys, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { surveys, ...rest }
}

export default useFeedbackTargetSurveys
