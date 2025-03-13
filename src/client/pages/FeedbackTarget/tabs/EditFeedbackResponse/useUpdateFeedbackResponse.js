import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'

const useUpdateFeedbackResponse = () => {
  const mutationFn = async ({ id, data }) => apiClient.put(`/feedback-targets/${id}/response`, { data })

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['feedbackTarget', variables.id], feedbackTarget => ({
        ...feedbackTarget,
        ...response.data,
      }))
    },
  })

  return mutation
}

export default useUpdateFeedbackResponse
