import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const usePinger = (options = {}) => {
  const queryKey = 'ping'

  const result = useQuery(
    queryKey,
    async () => {
      const { data } = await apiClient.get('/ping')

      return data
    },
    {
      refetchInterval: 6 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
      cacheTime: 7 * 60 * 1000,
      onError: error => {
        if (error?.message?.toLowerCase() === 'network error') window.location.reload()
      },
      ...options,
    }
  )

  return result
}

export default usePinger
