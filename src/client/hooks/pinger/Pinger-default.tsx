import { AxiosError } from 'axios'
import { useQuery } from 'react-query'
import apiClient from '../../util/apiClient'

const isNetworkError = (error: unknown): error is AxiosError =>
  !!(error as AxiosError).isAxiosError && !(error as AxiosError).response

const useDefaultPinger = (options = {}) => {
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
        if (isNetworkError(error)) window.location.reload()
      },
      ...options,
    }
  )
}

export default useDefaultPinger
