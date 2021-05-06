import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useAuthorizedUser = () => {
  const queryKey = 'authorizedUser'

  const { data: authorizedUser, ...rest } = useQuery(queryKey, async () => {
    const { data } = await apiClient.get('/login')

    return data
  })

  return { authorizedUser, ...rest }
}

export default useAuthorizedUser
