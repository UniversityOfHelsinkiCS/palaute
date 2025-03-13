import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'

const useUpdateSettingsRead = () => {
  const mutationFn = async ({ id }) => apiClient.put(`/feedback-targets/${id}`, { settingsReadByTeacher: true })

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

export default useUpdateSettingsRead
