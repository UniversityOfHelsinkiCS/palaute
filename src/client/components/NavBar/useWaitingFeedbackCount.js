import { useQuery } from '@tanstack/react-query'
import apiClient from '../../util/apiClient'

const defaultCacheTime = 900000

const useWaitingFeedbackCount = (options = {}) => {
  const queryFn = async () => {
    const { data } = await apiClient.get('/feedback-targets/for-student/waiting-count')

    return data.count
  }

  const { data: waitingFeedbackCount, ...rest } = useQuery({
    queryKey: ['myFeedbacksWaitingFeedbackCount'],
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { waitingFeedbackCount, ...rest }
}

export default useWaitingFeedbackCount
