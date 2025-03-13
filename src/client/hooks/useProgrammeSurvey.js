import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useProgrammeSurvey = (organisationCode, options = {}) => {
  const queryKey = ['programmeSurvey', organisationCode]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/surveys/programme/${organisationCode}`)

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
