import type { GetNoadUserResponse } from '@common/types/user'

import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useNoadUser = (options = {}) => {
  const queryKey = 'noadUser'
  const queryFn = async () => {
    const { data } = await apiClient.get<GetNoadUserResponse>('/user')
    return data
  }

  const { data: noadUser, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { noadUser, ...rest }
}

export default useNoadUser
