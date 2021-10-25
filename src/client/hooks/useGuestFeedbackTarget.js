import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useGuestFeedbackTarget = (targetId, options = {}) => {
  const queryKey = ['feedbackTarget', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/noad/feedback-targets/${targetId}`)

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbackTarget, ...rest }
}

export default useGuestFeedbackTarget
