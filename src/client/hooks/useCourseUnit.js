import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useCourseUnit = (code, options = {}) => {
  const queryKey = ['courseUnit', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-units/${code}`)

    return data
  }

  const { data: courseUnit, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(code),
    ...options,
  })

  return { courseUnit, ...rest }
}

export default useCourseUnit
