import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

export const queryKey = ['organisationSurveys']

const useOrganisationSurveys = organisationCode => {
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${organisationCode}/surveys`)

    return data
  }

  const { data: surveys, ...rest } = useQuery(queryKey, queryFn)

  return { surveys, ...rest }
}

export default useOrganisationSurveys
