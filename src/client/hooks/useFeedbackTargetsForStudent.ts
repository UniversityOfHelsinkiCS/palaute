import type { GetFeedbackTargetsForStudentResponse } from '@common/types/feedbackTarget'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const queryFn = async () => {
  const { data } = await apiClient.get<GetFeedbackTargetsForStudentResponse>('/feedback-targets/for-student')

  return data
}

const useFeedbackTargetsForStudent = (options: Partial<UseQueryOptions<GetFeedbackTargetsForStudentResponse>> = {}) => {
  const queryKey = 'feedbackTargetsForStudent'

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useFeedbackTargetsForStudent
