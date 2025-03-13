import { useQuery } from '@tanstack/react-query'
import apiClient from '../../util/apiClient'

const useDefaultPinger = (options = {}) => {
  const queryKey = ['ping']

  useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get('/ping')

      return data
    },
    refetchInterval: 6 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
    gcTime: 7 * 60 * 1000,
    ...options,
  })
}

export default useDefaultPinger
