import { useQuery } from 'react-query'
import apiClient from '../util/apiClient'

const useNoadUser = (options = {}) => {
  const queryKey = 'noadUser'

  const { data: noadUser, ...rest } = useQuery(
    queryKey,
    async () => {
      const { data } = await apiClient.get('/user')

      return data
    },
    options
  )

  return { noadUser, ...rest }
}

export default useNoadUser
