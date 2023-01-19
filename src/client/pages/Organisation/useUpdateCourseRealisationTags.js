const { useMutation } = require('react-query')
const { default: apiClient } = require('../../util/apiClient')
const { default: queryClient } = require('../../util/queryClient')

const useUpdateCourseRealisationTags = () => {
  const mutationFn = async ({ organisationCode, courseRealisationIds, tagIds }) =>
    apiClient.put(`/tags/${organisationCode}/course-realisations`, {
      courseRealisationIds,
      tagIds,
    })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, variables) => {
      queryClient.refetchQueries(['organisationFeedbackTargets', variables.organisationCode])
    },
  })

  return mutation
}

export default useUpdateCourseRealisationTags
