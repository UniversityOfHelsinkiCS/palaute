import { useMutation } from 'react-query'
import apiClient from '../../../../../util/apiClient'
import queryClient from '../../../../../util/queryClient'
import { useFeedbackTargetContext } from '../../../FeedbackTargetContext'

/**
 * For hiding open feedbacks. Gets the feedback target from FeedbackTargetContext,
 * meaning it can only be used in the context
 */
const useUpdateOpenFeedbackVisibility = () => {
  const { feedbackTarget, isTeacher, isOrganisationAdmin } = useFeedbackTargetContext()

  const mutationFn = async ({ feedbackId, questionId, hidden }) =>
    apiClient.put(`/feedbacks/${feedbackId}/question/${questionId}`, { hidden })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, { feedbackId, questionId }) => {
      const { hidden } = response.data

      queryClient.setQueryData(['feedbackTargetFeedbacks', String(feedbackTarget.id)], data => {
        const { feedbacks } = data
        const updatedFeedbacks = feedbacks.map(f =>
          f.id === feedbackId
            ? {
                ...f,
                data: f.data.map(q => (q.questionId === questionId ? { ...q, hidden } : q)),
              }
            : f
        )

        return { ...data, feedbacks: updatedFeedbacks }
      })
    },
  })

  const canHide = isTeacher || isOrganisationAdmin

  const toggleVisibility = async feedback => {
    try {
      await mutation.mutateAsync({
        feedbackId: feedback.feedbackId,
        questionId: feedback.questionId,
        hidden: !feedback.hidden,
      })
    } catch (e) {
      console.error(e.response)
    }
  }

  return {
    canHide,
    toggleVisibility,
  }
}

export default useUpdateOpenFeedbackVisibility
