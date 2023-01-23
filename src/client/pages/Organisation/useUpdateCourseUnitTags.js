const { useMutation } = require('react-query')
const { default: apiClient } = require('../../util/apiClient')
const { default: queryClient } = require('../../util/queryClient')

const useUpdateCourseUnitTags = () => {
  const mutationFn = async ({ organisationCode, courseCode, tagIds }) =>
    apiClient.put(`/tags/${organisationCode}/course-units`, {
      courseCode,
      tagIds,
    })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['organisationCourseUnits', variables.organisationCode], courseUnits => {
        const tags = response.data
        return courseUnits.map(cu => (cu.courseCode === variables.courseCode ? { ...cu, tags } : cu))
      })
    },
  })

  return mutation
}

export default useUpdateCourseUnitTags
