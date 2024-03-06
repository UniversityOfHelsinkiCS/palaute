import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useAuthorizedUser = (options = {}) => {
  const queryKey = 'authorizedUser'

  const { data: authorizedUser, ...rest } = useQuery(
    queryKey,
    async () => {
      const { data } = await apiClient.get('/login')

      return data
    },
    {
      staleTime: 1000 * 60 * 60 * 24,
      ...options,
    }
  )

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
