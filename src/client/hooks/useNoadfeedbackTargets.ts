import type { GetNoadCoursesResponse } from '@common/types/feedbackTarget'

import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNoadfeedbackTargets = (options = {}) => {
  const queryKey = 'noadCourses'

  const queryFn = async () => {
    const { data } = await apiClient.get<GetNoadCoursesResponse>('/courses')

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useNoadfeedbackTargets
