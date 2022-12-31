import _ from 'lodash'
import { useMutation } from 'react-query'
import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

const useQuestionPublicityMutation = ({ resource, resourceId }) => {
  const resourcePathName = _.kebabCase(resource)
  const mutationFn = async publicQuestionIds => {
    const res = await apiClient.put(`/${resourcePathName}s/${resourceId}`, {
      publicQuestionIds,
    })
    return res.data.publicQuestionIds
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: publicQuestionIds => {
      const queryKey = [resource, String(resourceId)]
      queryClient.setQueryData(queryKey, resource => ({
        ...resource,
        publicQuestionIds,
      }))
    },
  })

  return mutation
}

export default useQuestionPublicityMutation
