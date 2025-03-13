import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useCourseRealisationFeedbackTargets = (id, options = {}) => {
  const queryKey = ['courseRealisationFeedbackTargets', id]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/for-course-realisation/${id}`)

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useCourseRealisationFeedbackTargets
