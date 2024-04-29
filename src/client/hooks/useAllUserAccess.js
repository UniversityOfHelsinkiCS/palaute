import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useAllUserAccess = (options = {}) => {
  const queryKey = 'allUserAccess'

  const queryFn = async () => {
    const { data } = await apiClient.get(`/users/access`)

    return data
  }

  const { data: usersWithAccess, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { usersWithAccess, ...rest }
}

export default useAllUserAccess
