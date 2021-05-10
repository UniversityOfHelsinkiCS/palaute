import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useUniversitySurvey = () => {
  const queryKey = ['universitySurvey']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/university`)

    return data
  }

  const { data: survey, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: 0,
  })

  return { survey, ...rest }
}

export default useUniversitySurvey
