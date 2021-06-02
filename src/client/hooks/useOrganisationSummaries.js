import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationSummaries = (options = {}) => {
  const { from, to, ...queryOptions } = options
  const queryKey = ['organisationSummaries']

  const queryFn = async () => {
    const { data } = await apiClient.get('/course-summaries/organisations')

    return data
  }

  const { data: organisationSummaries, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...queryOptions,
  })

  return { organisationSummaries, ...rest }
}

export default useOrganisationSummaries
