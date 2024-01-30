import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutationFn = async ({ feedbackContent, feedbackTargetId, questionId, hidden }) =>
    apiClient.put(`/feedback-targets/${feedbackTargetId}/hide-feedback`, { hidden, feedbackContent, questionId })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, { feedbackId, questionId }) => {
      const { hidden } = response.data

      queryClient.setQueriesData(['feedbackTargetFeedbacks', String(feedbackTarget.id)], data => {
        const feedbacks = data?.feedbacks
        if (!feedbacks) return data

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

  const toggleVisibility = async (feedback, feedbackTargetId) => {
    try {
      await mutation.mutateAsync({
        feedbackContent: feedback.data,
        questionId: feedback.questionId,
        hidden: !feedback.hidden,
        feedbackTargetId,
      })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return {
    canHide,
    toggleVisibility,
  }
}

export default useUpdateOpenFeedbackVisibility
