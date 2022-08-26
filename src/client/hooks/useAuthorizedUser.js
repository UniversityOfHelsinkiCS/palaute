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
      refetchInterval: 2 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
      cacheTime: 2 * 60 * 1000,
      onError: (error) => {
        if (error?.message?.toLowerCase() === 'network error')
          window.location.reload()
      },
      ...options,
    },
  )

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
