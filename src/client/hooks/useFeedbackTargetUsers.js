import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackTargetUsers = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetUsers', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${targetId}/users`)

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
