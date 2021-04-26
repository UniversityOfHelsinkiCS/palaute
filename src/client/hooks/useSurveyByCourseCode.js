import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useSurveyByCourseCode = (code, options = {}) => {
  const queryKey = ['surveyByCourseCode', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-units/${code}/survey`)

    return data
  }

  const { data: survey, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(code),
    ...options,
  })

  return { survey, ...rest }
}

export default useSurveyByCourseCode
