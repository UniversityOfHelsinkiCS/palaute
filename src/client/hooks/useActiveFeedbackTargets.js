import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useActiveFeedbackTargets = () => {
  const queryKey = ['activeFeedbackTargets']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/admin/feedback-targets`)

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn)

  return { feedbackTargets, ...rest }
}

export default useActiveFeedbackTargets
