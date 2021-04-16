import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useUserFeedbackTargetsForStudent = () => {
  const queryKey = 'userFeedbackTargetsForStudent'

  const { data: userFeedbackTargets, ...rest } = useQuery(
    queryKey,
    async () => {
      const { data } = await apiClient.get('/user-feedback-targets/for-student')

      return data
    },
  )

  return { userFeedbackTargets, ...rest }
}

export default useUserFeedbackTargetsForStudent
