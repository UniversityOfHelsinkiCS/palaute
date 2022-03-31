import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNorppaFeedbackCount = (options = {}) => {
  const queryKey = 'noadUser'

  const queryFn = async () => {
    const { data } = await apiClient.get('/norppa-feedback/count')

    return data
  }

  const { data: norppaFeedbackCount, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { norppaFeedbackCount, ...rest }
}

export default useNorppaFeedbackCount
