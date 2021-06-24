import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useUniversitySurvey = (options = {}) => {
  const queryKey = ['universitySurvey']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/university`)

    return data
  }

  const { data: survey, ...rest } = useQuery(queryKey, queryFn, {
    skipCache: true,
    ...options,
  })

  return { survey, ...rest }
}

export default useUniversitySurvey
