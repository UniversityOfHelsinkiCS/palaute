import { useQuery } from '@tanstack/react-query'

import { ORGANISATION_SURVEYS_ENABLED } from '../../util/common'
import apiClient from '../../util/apiClient'

export const queryKey = ['organisationSurveysForUser']

export const useOrganisationSurveysForUser = (enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get('/organisations/surveys-for-user')

    return data
  }

  const { data: organisationsWithSurveys, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: enable && ORGANISATION_SURVEYS_ENABLED,
  })

  return { organisationsWithSurveys, ...rest }
}
