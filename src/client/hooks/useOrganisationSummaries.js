import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationSummaries = (options = {}) => {
  const { includeOpenUniCourseUnits = true, ...queryOptions } = options

  const params = {
    includeOpenUniCourseUnits:
      includeOpenUniCourseUnits === true ? 'true' : 'false',
  }

  const queryKey = ['organisationSummaries', params]

  const queryFn = async () => {
    const { data } = await apiClient.get('/course-summaries/organisations', {
      params,
    })

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
