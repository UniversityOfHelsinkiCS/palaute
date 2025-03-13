import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../../util/apiClient'
import { updateCache } from '../../../../util/reactQuery'

export const useSendReminderEmail = () => {
  const mutationFn = async ({ id, data }) =>
    apiClient.put(`/feedback-targets/${id}/remind-students`, {
      data,
    })

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      updateCache(['feedbackTarget', String(variables.id)], draft => {
        const { data } = response
        draft.feedbackReminderLastSentAt = data.feedbackReminderLastSentAt
      })
    },
  })

  return mutation
}
