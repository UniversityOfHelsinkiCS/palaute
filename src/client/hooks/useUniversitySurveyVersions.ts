import { useQuery } from '@tanstack/react-query'
import type { Survey } from '@common/types/survey'
import apiClient from '../util/apiClient'

const useUniversitySurveyVersions = () => {
  const queryKey = ['universitySurveyVersions']
  const queryFn = async () => {
    const { data } = await apiClient.get<Survey[]>('/surveys/university/versions')
    return data
  }

  const { data: versions = [], ...rest } = useQuery({
    queryKey,
    queryFn,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24,
  })

  return { versions, ...rest }
}

export default useUniversitySurveyVersions
