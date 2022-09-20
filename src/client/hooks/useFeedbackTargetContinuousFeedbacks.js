import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackTargetContinuousFeedbacks = (targetId, options = {}) => {
  const queryKey = ['feedbackTargetContinuousFeedbacks', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/feedback-targets/${targetId}/continuous-feedbacks`,
    )

    return data
  }

  const { data: continuousFeedbacks, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { continuousFeedbacks, ...rest }
}

export default useFeedbackTargetContinuousFeedbacks
