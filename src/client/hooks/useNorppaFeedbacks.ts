import type { User } from '@common/types/user'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useNorppaFeedbacks = (options = {}) => {
  const queryKey = 'norppaFeedbacks'

  const queryFn = async () => {
    const { data } =
      await apiClient.get<
        Array<{ id: number; createdAt: string; data: string; responseWanted: boolean; solved: boolean; user: User }>
      >('/norppa-feedback')

    return data
  }

  const { data: feedbacks, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
    ...options,
  })

  return { feedbacks, ...rest }
}

export default useNorppaFeedbacks
