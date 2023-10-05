import { useMutation } from 'react-query'

import apiClient from '../util/apiClient'

export const useCreateOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async ({ name, startDate, endDate }) => {
    const res = await apiClient.post(`/organisations/${organisationCode}/surveys`, {
      name,
      startDate,
      endDate,
    })

    return res.data
  }

  const mutation = useMutation(mutationFn)

  return mutation
}
