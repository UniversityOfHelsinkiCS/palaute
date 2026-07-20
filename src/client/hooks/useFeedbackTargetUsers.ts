import type { GetFeedbackTargetUsersResponse } from '@common/types/feedbackTarget'

import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackTargetUsers = (targetId: number | string, options = {}) => {
  const queryKey = ['feedbackTargetUsers', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetFeedbackTargetUsersResponse>(`/feedback-targets/${targetId}/users`)

    return data
  }

  const { data: users, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: !!targetId,
    ...options,
  })

  return { users, ...rest }
}

export default useFeedbackTargetUsers
