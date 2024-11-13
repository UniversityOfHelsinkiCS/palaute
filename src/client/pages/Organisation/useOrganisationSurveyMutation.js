import { useMutation } from 'react-query'
import { endOfDay, startOfDay } from 'date-fns'

import { queryKey } from './useOrganisationSurveys'
import queryClient from '../../util/queryClient'
import apiClient from '../../util/apiClient'
import { updateCache } from '../../util/reactQuery'

export const useCreateOrganisationSurveyMutation = (organisationCode) => {
  const mutationFn = async ({
    name,
    startDate,
    endDate,
    studentNumbers,
    teacherIds,
    courseIds,
  }) => {
    const { data } = await apiClient.post(
      `/organisations/${organisationCode}/surveys`,
      {
        name,
        startDate: startDate ? startOfDay(new Date(startDate)) : null,
        endDate: endDate ? endOfDay(new Date(endDate)) : null,
        studentNumbers,
        teacherIds,
        courseIds,
      }
    )

    return data
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return mutation
}

export const useEditOrganisationSurveyMutation = (organisationCode) => {
  const mutationFn = async ({
    surveyId,
    name,
    startDate,
    endDate,
    studentNumbers,
    teacherIds,
    courseIds,
  }) => {
    const { data } = await apiClient.put(
      `/organisations/${organisationCode}/surveys/${surveyId}`,
      {
        name,
        startDate,
        endDate,
        studentNumbers,
        teacherIds,
        courseIds,
      }
    )

    return data
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: (data) => {
      const { id, name, opensAt, closesAt } = data

      queryClient.invalidateQueries('organisationSurvey')

      updateCache(['feedbackTarget', String(id)], (draft) => {
        draft.opensAt = opensAt
        draft.closesAt = closesAt
        draft.courseRealisation.name = name
      })
    },
  })

  return mutation
}

export const useDeleteOrganisationSurveyMutation = (organisationCode) => {
  const mutationFn = async (surveyId) => {
    await apiClient.delete(
      `/organisations/${organisationCode}/surveys/${surveyId}`
    )
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return mutation
}
