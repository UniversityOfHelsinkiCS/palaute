import { useQuery } from '@tanstack/react-query'

import { ORGANISATION_SURVEYS_ENABLED } from '../../util/common'
import apiClient from '../../util/apiClient'

export const queryKey = ['organisationSurveys']

export const useOrganisationSurvey = (organisationCode, surveyId, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${organisationCode}/surveys/${surveyId}`)

    return data
  }

  const query = useQuery({
    queryKey: ['organisationSurvey', surveyId],
    queryFn,
    enabled: enable && ORGANISATION_SURVEYS_ENABLED,
  })

  return {
    survey: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    ...query,
  }
}

export const useOrganisationSurveys = (organisationCode, enable = true) => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${organisationCode}/surveys`)

    return data
  }

  const { data: surveys, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: enable && ORGANISATION_SURVEYS_ENABLED,
  })

  return { surveys, ...rest }
}
