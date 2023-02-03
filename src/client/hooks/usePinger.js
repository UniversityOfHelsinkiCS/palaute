import { useQuery } from 'react-query'
import apiClient from '../util/apiClient'

const usePinger = (options = {}) => {
  const queryKey = 'ping'

  useQuery(
    queryKey,
    async () => {
      const { data } = await apiClient.get('/ping')

      return data
    },
    {
      refetchInterval: 6 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      cacheTime: 7 * 60 * 1000,
      onError: error => {
        if (error?.message?.toLowerCase() === 'network error') window.location.reload()
      },
      ...options,
    }
  )
}

export default usePinger
