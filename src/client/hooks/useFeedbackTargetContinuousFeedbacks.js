import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackTargetContinuousFeedbacks = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetContinuousFeedbacks', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/continuous-feedback/${targetId}`)

    return data
  }

  const { data: continuousFeedbacks, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { continuousFeedbacks, ...rest }
}

export default useFeedbackTargetContinuousFeedbacks
