import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useOrganisationSummary = (code, options = {}) => {
  const { includeOpenUniCourseUnits = true, ...queryOptions } = options

  const params = {
    includeOpenUniCourseUnits:
      includeOpenUniCourseUnits === true ? 'true' : 'false',
  }

  const queryKey = ['organisationSummary', code, params]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-summaries/organisations/${code}`,
      {
        params,
      },
    )

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    skipCache: true,
    ...queryOptions,
  })

  return { data, ...rest }
}

export default useOrganisationSummary
