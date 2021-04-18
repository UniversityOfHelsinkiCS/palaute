import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const queryFn = (path) => async () => {
  const { data } = await apiClient.get(path)

  return data
}

const useFeedbackTargetsForStudent = () => {
  const queryKey = 'feedbackTargetsForStudent'

  const { data: feedbackTargets, ...rest } = useQuery(
    queryKey,
    queryFn('/feedback-targets/for-student'),
  )

  return { feedbackTargets, ...rest }
}

export const useFeedbackTarget = (targetId) => {
  const queryKey = ['feedbackTarget', targetId]

  const { data: feedbackTarget, ...rest } = useQuery(
    queryKey,
    queryFn(`/feedback-targets/${targetId}`),
  )

  return { feedbackTarget, ...rest }
}

export default useFeedbackTargetsForStudent
