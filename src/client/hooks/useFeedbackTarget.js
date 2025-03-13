import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useFeedbackTarget = (targetId, options = {}) => {
  const queryKey = ['feedbackTarget', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${targetId}`)

    return data
  }

  const { data: feedbackTarget, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbackTarget, ...rest }
}

export default useFeedbackTarget
