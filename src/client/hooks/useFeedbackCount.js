import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackCount = (targetId, options = {}) => {
  const queryKey = ['feedbackCount', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/feedback-targets/${targetId}/feedback-count`,
    )

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(targetId),
    ...options,
  })

  return { feedbackCount: data?.feedbackCount, ...rest }
}

export default useFeedbackCount
