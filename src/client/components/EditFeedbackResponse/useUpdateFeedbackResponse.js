import { useMutation } from 'react-query'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'

const useUpdateFeedbackResponse = () => {
  const mutationFn = async ({ id, data }) => {
    console.log(data)
    return apiClient.put(`/feedback-targets/${id}/response`, { data })
  }

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, variables) => {
      console.log(response.data)
      queryClient.setQueryData(
        ['feedbackTarget', variables.id],
        (feedbackTarget) => ({ ...feedbackTarget, ...response.data }),
      )
    },
  })

  return mutation
}

export default useUpdateFeedbackResponse
