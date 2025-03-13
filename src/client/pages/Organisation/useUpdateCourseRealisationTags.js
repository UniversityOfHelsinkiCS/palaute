import { useMutation } from '@tanstack/react-query'

import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'

const useUpdateCourseRealisationTags = () => {
  const mutationFn = async ({ organisationCode, courseRealisationIds, tagIds }) =>
    apiClient.put(`/tags/${organisationCode}/course-realisations`, {
      courseRealisationIds,
      tagIds,
    })

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      queryClient.refetchQueries(['organisationFeedbackTargets', variables.organisationCode])
    },
  })

  return mutation
}

export default useUpdateCourseRealisationTags
