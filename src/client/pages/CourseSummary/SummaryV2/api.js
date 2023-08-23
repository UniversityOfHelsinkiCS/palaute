import { useQuery } from 'react-query'
import apiClient from '../../../util/apiClient'

export const useSummaries = ({ startDate, endDate, entityId, enabled }) => {
  const queryKey = ['summaries-v2', entityId, startDate]

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/organisations-v2`, {
      params: {
        entityId,
        startDate,
        endDate,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    enabled,
    retry: false,
  })

  const { organisation, questions } = data || {}

  return { organisation, questions, ...rest }
}
