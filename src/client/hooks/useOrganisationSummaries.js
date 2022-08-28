import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationSummaries = (options = {}) => {
  const {
    code,
    includeOpenUniCourseUnits = true,
    startDate,
    endDate,
    ...queryOptions
  } = options

  const params = {
    code,
    includeOpenUniCourseUnits:
      includeOpenUniCourseUnits === true ? 'true' : 'false',
    startDate,
    endDate,
  }

  const queryKey = ['organisationSummaries', params]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/organisations`, {
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
