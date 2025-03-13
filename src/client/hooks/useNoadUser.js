import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useNoadUser = (options = {}) => {
  const queryKey = 'noadUser'
  const queryFn = async () => {
    const { data } = await apiClient.get('/user')
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
