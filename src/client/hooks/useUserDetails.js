const { useQuery } = require('react-query')
const { default: apiClient } = require('../util/apiClient')

const useUserDetails = (userId, options = {}) => {
  const queryKey = ['user', userId]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/users/${userId}`)

    return data
  }

  const { data: user, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { user, ...rest }
}

export default useUserDetails
