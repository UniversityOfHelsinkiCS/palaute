import { kebabCase } from 'lodash-es'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'

interface UseQuestionPublicityMutationParams {
  resource: string
  resourceId: number | string
}

const useQuestionPublicityMutation = ({ resource, resourceId }: UseQuestionPublicityMutationParams) => {
  const resourcePathName = kebabCase(resource)
  const mutationFn = async (publicQuestionIds: number[]) => {
    const res = await apiClient.put<{ publicQuestionIds: number[] }>(`/${resourcePathName}s/${resourceId}`, {
      publicQuestionIds,
    })
    return res.data.publicQuestionIds
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess: publicQuestionIds => {
      const queryKey = [resource, String(resourceId)]
      queryClient.setQueryData(queryKey, (current: Record<string, unknown>) => ({
        ...current,
        publicQuestionIds,
      }))
    },
  })

  return mutation
}

export default useQuestionPublicityMutation
