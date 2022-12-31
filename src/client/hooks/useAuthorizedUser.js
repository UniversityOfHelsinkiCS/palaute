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
    options
  )

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
