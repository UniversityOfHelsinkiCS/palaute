import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useNoadUser = (options = {}) => {
  const queryKey = 'noadUser'

  const queryFn = async () => {
    const { data } = await apiClient.get('/noad/courses')

    return data
  }

  const { data: courses, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { courses, ...rest }
}

export default useNoadUser
