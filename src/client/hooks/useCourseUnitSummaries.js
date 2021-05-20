import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useCoureUnitSummaries = (options = {}) => {
  const { from, to, ...queryOptions } = options
  const queryKey = ['courseUnitSummaries', { from, to }]

  const params = {
    ...(from && { from: new Date(from).toISOString() }),
    ...(to && { to: new Date(to).toISOString() }),
  }

  const queryFn = async () => {
    const { data } = await apiClient.get('/course-unit-summaries', { params })

    return data
  }

  const { data: courseUnitSummaries, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...queryOptions,
  })

  return { courseUnitSummaries, ...rest }
}

export default useCoureUnitSummaries
