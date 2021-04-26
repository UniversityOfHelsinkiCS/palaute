import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useCourseRealisationFeedbackTargets = (code, options = {}) => {
  const queryKey = ['courseUnitFeedbackTargets', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-units/${code}/feedback-targets`,
    )

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(code),
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useCourseRealisationFeedbackTargets
