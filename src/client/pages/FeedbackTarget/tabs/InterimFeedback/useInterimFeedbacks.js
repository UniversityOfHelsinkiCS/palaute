import { useQuery } from '@tanstack/react-query'

import { INTERIM_FEEDBACKS_ENABLED } from '../../../../util/common'
import apiClient from '../../../../util/apiClient'

export const useInterimFeedbackParent = (interimFbtId, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/interimFeedbacks/${interimFbtId}/parent`)

    return data
  }

  const { data: parentFeedback, ...rest } = useQuery({
    queryKey: ['interimFeedbackParent', interimFbtId],
    queryFn,
    enabled: enable && INTERIM_FEEDBACKS_ENABLED,
  })

  return { parentFeedback, ...rest }
}

export const useInterimFeedbacks = (parentId, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${parentId}/interimFeedbacks`)

    return data
  }

  const { data: interimFeedbacks, ...rest } = useQuery({
    queryKey: ['interimFeedbacks', parentId],
    queryFn,
    enabled: enable && INTERIM_FEEDBACKS_ENABLED,
  })

  return { interimFeedbacks, ...rest }
}
