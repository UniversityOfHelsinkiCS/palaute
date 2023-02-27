import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationSummaries = (options = {}) => {
  const { code, includeOpenUniCourseUnits = true, tagId, startDate, endDate, enabled, ...queryOptions } = options

  const params = {
    includeOpenUniCourseUnits: includeOpenUniCourseUnits === true ? 'true' : 'false',
    tagId,
    startDate,
    endDate,
  }

  const queryKey = ['organisationSummaries', params, code || 'ALL']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/organisations/${code || ''}`, {
      params,
    })

    return data
  }

  const { data: organisationSummaries, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...queryOptions,
  })

  return { organisationSummaries, ...rest }
}

export default useOrganisationSummaries
