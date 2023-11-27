import { useQuery } from 'react-query'

import { INTERIM_FEEDBACKS_ENABLED } from '../../../../util/common'
import apiClient from '../../../../util/apiClient'

export const useInterimFeedbacks = (parentId, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/feedback-targets/${parentId}/interimFeedbacks`)

    return data
  }

  const { data: interimFeedbacks, ...rest } = useQuery(['interimFeedbacks', parentId], queryFn, {
    enabled: enable && INTERIM_FEEDBACKS_ENABLED,
  })

  return { interimFeedbacks, ...rest }
}
