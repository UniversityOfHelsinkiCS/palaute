import { useMutation } from 'react-query'

import apiClient from '../util/apiClient'

export const useCreateOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async ({ name, startDate, endDate }) => {
    const { data } = await apiClient.post(`/organisations/${organisationCode}/surveys`, {
      name,
      startDate,
      endDate,
    })

    return data
  }

  const mutation = useMutation(mutationFn)

  return mutation
}
