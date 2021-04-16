import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useUserFeedbackTarget = (id) => {
  const queryKey = ['userFeedbackTarget', id]

  const { data: userFeedbackTarget, ...rest } = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/user-feedback-targets/${id}`)

    return data
  })

  return { userFeedbackTarget, ...rest }
}

export default useUserFeedbackTarget
