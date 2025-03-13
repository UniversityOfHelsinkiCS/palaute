import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNorppaFeedbacks = (options = {}) => {
  const queryKey = 'norppaFeedbacks'

  const queryFn = async () => {
    const { data } = await apiClient.get('/norppa-feedback')

    return data
  }

  const { data: feedbacks, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { feedbacks, ...rest }
}

export default useNorppaFeedbacks
