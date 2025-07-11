import type { LoggedInUser } from '@common/types/user'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useAuthorizedUser = (options = {}) => {
  const queryKey = 'authorizedUser'
  const queryFn = async () => {
    const { data } = await apiClient.get<LoggedInUser>('/login')
    return data
  }

  // destructuring considered harmful, but ok
  const { data: authorizedUser, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
