import { useQuery } from 'react-query'
import apiClient from '../../../util/apiClient'

export const useSummaries = (options = {}) => {
  const { startDate, endDate, entityId } = options
  console.log(entityId)

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

  const { data, ...rest } = useQuery('summaries-v2', queryFn)

  return { data, ...rest }
}
