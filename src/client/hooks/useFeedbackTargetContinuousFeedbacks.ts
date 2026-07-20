import type { GetContinuousFeedbacksResponse } from '@common/types/feedbackTarget'

import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useFeedbackTargetContinuousFeedbacks = (targetId: number | string, isEnabled = true) => {
  const queryKey = ['feedbackTargetContinuousFeedbacks', targetId]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetContinuousFeedbacksResponse>(`/continuous-feedback/${targetId}`)

    return data
  }

  const { data: continuousFeedbacks, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(targetId) && isEnabled,
  })

  return { continuousFeedbacks, ...rest }
}

export default useFeedbackTargetContinuousFeedbacks
