import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useUserIsTeacher = (options = {}) => {
  const queryKey = 'userIsTeacher'

  const queryFn = async () => {
    const { data } = await apiClient.get('/user-is-teacher')

    return data
  }

  const { data: userIsTeacher, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { userIsTeacher, ...rest }
}

export default useUserIsTeacher
