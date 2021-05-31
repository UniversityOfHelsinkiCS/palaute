import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useProgrammeSurvey = () => {
  const queryKey = ['programmeSurvey']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/programme`)

    return data
  }

  const { data: survey, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: 0,
  })

  return { survey, ...rest }
}

export default useProgrammeSurvey
