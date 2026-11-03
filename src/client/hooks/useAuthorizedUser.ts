import type { GetLoginResponse } from '@common/types/user'

import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import apiClient from '../util/apiClient'

// React Query retries 3 times by default
const MAX_RETRIES = 3

// A 403 means the Shibboleth session is missing, so retrying only delays the error message
const retry = (failureCount: number, error: Error) =>
  !(isAxiosError(error) && error.response?.status === 403) && failureCount < MAX_RETRIES

const useAuthorizedUser = (options = {}) => {
  const queryKey = 'authorizedUser'
  const queryFn = async () => {
    const { data } = await apiClient.get<GetLoginResponse>('/login')
    return data
  }

  // destructuring considered harmful, but ok
  const { data: authorizedUser, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    retry,
    ...options,
  })

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
