import { useMutation } from '@tanstack/react-query'

import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'

const useUpdateCourseUnitTags = () => {
  const mutationFn = async ({ organisationCode, courseCode, tagIds }) =>
    apiClient.put(`/tags/${organisationCode}/course-units`, {
      courseCode,
      tagIds,
    })

  const mutation = useMutation({
    mutationFn,
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
