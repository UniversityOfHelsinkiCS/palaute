import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import type { GetStudentsWithFeedbackResponse } from '@common/types/feedbackTarget'
import apiClient from '../util/apiClient'

const useStudentsWithFeedback = (
  targetId: number | string,
  options: Partial<UseQueryOptions<GetStudentsWithFeedbackResponse>> = {}
) => {
  const queryKey = ['studentsWithFeedback', targetId]
  const queryFn = async () => {
    const { data } = await apiClient.get<GetStudentsWithFeedbackResponse>(
      `/feedback-targets/${targetId}/students-with-feedback`
    )
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
