import type { GetProgrammeSurveyResponse } from '@common/types/survey'
import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useProgrammeSurvey = (organisationCode: string | undefined, options = {}) => {
  const queryKey = ['programmeSurvey', organisationCode]

  const queryFn = async () => {
    const { data } = await apiClient.get<GetProgrammeSurveyResponse>(`/surveys/programme/${organisationCode}`)
    return data
  }

  const { data: survey, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { survey, ...rest }
}

export default useProgrammeSurvey
