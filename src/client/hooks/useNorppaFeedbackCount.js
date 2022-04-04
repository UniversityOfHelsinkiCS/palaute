import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNorppaFeedbackCount = (options = {}, isAdminUser) => {
  const queryKey = 'norppaFeedbackCount'

  const queryFn = async () => {
    const { data } = await apiClient.get('/norppa-feedback/count')

    return data
  }

  const { data: norppaFeedbackCount, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
    enabled: isAdminUser,
  })

  return { norppaFeedbackCount, ...rest }
}

export default useNorppaFeedbackCount
