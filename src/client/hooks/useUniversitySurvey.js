import { useQuery } from '@tanstack/react-query'
import apiClient from '../util/apiClient'

const useUniversitySurvey = (at, options = {}) => {
  const queryKey = ['universitySurvey', at ?? null]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/university${at ? `?at=${at}` : ''}`)
    return data
  }

  const { data: survey, ...rest } = useQuery({
    queryKey,
    queryFn,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24,
    ...options,
  })

  return { survey, ...rest }
}

export default useUniversitySurvey
