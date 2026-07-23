import type { GetUserDetailsResponse } from '@common/types/user'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useUserDetails = (userId: string, options: Partial<UseQueryOptions<GetUserDetailsResponse>> = {}) => {
  const queryKey = ['user', userId]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetUserDetailsResponse>(`/users/${userId}`)

    return data
  }

  const { data: user, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { user, ...rest }
}

export default useUserDetails
