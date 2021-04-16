import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useFeedbackTargetsForStudent = () => {
  const queryKey = 'feedbackTargetsForStudent'

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, async () => {
    const { data } = await apiClient.get('/feedback-targets/for-student')

    return data
  })

  return { feedbackTargets, ...rest }
}

export default useFeedbackTargetsForStudent
