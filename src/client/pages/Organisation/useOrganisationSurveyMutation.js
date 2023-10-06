import { useMutation } from 'react-query'

import { queryKey } from './useOrganisationSurveys'
import queryClient from '../../util/queryClient'
import apiClient from '../../util/apiClient'

export const useCreateOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async ({ name, startDate, endDate, studentNumbers, teacherIds }) => {
    const { data } = await apiClient.post(`/organisations/${organisationCode}/surveys`, {
      name,
      startDate,
      endDate,
      studentNumbers,
      teachers: teacherIds,
    })

    return data
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return mutation
}
