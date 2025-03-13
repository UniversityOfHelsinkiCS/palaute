import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useAuthorizedUser = (options = {}) => {
  const queryKey = 'authorizedUser'
  const queryFn = async () => {
    const { data } = await apiClient.get('/login')
    return data
  }

  const { data: authorizedUser, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
