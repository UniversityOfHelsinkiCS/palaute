import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const queryFn = async () => {
  const { data } = await apiClient.get('/feedback-targets/for-student')

  return data
}

const useFeedbackTargetsForStudent = (options = {}) => {
  const queryKey = 'feedbackTargetsForStudent'

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useFeedbackTargetsForStudent
