import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useProgrammeSurvey = (surveyCode) => {
  const queryKey = ['programmeSurvey', surveyCode]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/programme/${surveyCode}`)

    return data
  }

  const { data: survey, ...rest } = useQuery(queryKey, queryFn, {
    cacheTime: 0,
  })

  return { survey, ...rest }
}

export default useProgrammeSurvey
