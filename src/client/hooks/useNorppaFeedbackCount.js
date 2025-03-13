import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNorppaFeedbackCount = (options = {}) => {
  const queryKey = 'norppaFeedbackCount'

  const queryFn = async () => {
    const { data } = await apiClient.get('/norppa-feedback/count')

    return data
  }

  const { data: norppaFeedbackCount, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    refetchInterval: 1000 * 60 * 10,
    ...options,
  })

  return { norppaFeedbackCount, ...rest }
}

export default useNorppaFeedbackCount
