import { useMutation } from 'react-query'
import { endOfDay, startOfDay } from 'date-fns'

import { queryKey } from './useOrganisationSurveys'
import queryClient from '../../util/queryClient'
import apiClient from '../../util/apiClient'

export const useCreateOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async ({ name, startDate, endDate, studentNumbers, teacherIds }) => {
    const { data } = await apiClient.post(`/organisations/${organisationCode}/surveys`, {
      name,
      startDate: startDate ? startOfDay(new Date(startDate)) : null,
      endDate: endDate ? endOfDay(new Date(endDate)) : null,
      studentNumbers,
      teacherIds,
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

export const useEditOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async ({ surveyId, name, startDate, endDate, teacherIds }) => {
    const { data } = await apiClient.put(`/organisations/${organisationCode}/surveys/${surveyId}`, {
      name,
      startDate,
      endDate,
      teacherIds,
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

export const useDeleteOrganisationSurveyMutation = organisationCode => {
  const mutationFn = async surveyId => {
    await apiClient.delete(`/organisations/${organisationCode}/surveys/${surveyId}`)
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return mutation
}
