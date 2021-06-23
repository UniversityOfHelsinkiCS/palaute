import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useOrganisationCourseUnits = (code, options = {}) => {
  const queryKey = ['organisationCourseUnits', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${code}/course-units`)

    return data
  }

  const { data: courseUnits, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(code),
    ...options,
  })

  return { courseUnits, ...rest }
}

export default useOrganisationCourseUnits
