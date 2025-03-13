import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useStudentsWithFeedback = (targetId, options = {}) => {
  const queryKey = ['studentsWithFeedback', targetId]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${targetId}/students-with-feedback`)
    return data
  }

  const { data: students, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId),
    ...options,
  })

  return { students, ...rest }
}

export default useStudentsWithFeedback
