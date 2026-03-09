import { useQuery } from '@tanstack/react-query'
import apiClient from '../../util/apiClient'

export const queryKey = ['organisationSurveysForUser']

export const useOrganisationSurveysForUser = (enabled: boolean) => {
  const queryFn = async () => {
    const { data } = await apiClient.get('/organisations/surveys-for-user')

    return data
  }

  const { data: organisationsWithSurveys, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled,
  })

  return { organisationsWithSurveys, ...rest }
}
