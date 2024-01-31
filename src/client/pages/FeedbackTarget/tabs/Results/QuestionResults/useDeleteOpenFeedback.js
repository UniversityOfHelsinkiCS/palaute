import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import apiClient from '../../../../../util/apiClient'
import queryClient from '../../../../../util/queryClient'
import { useFeedbackTargetContext } from '../../../FeedbackTargetContext'

/**
 * For SUPERADMIN deleting feedbacks. Gets the feedback target from FeedbackTargetContext,
 * meaning it can only be used in the context
 */
const useDeleteOpenFeedback = () => {
  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutationFn = async ({ questionId, feedbackContent }) =>
    apiClient.put(`/feedback-targets/${feedbackTarget.id}/delete-feedback`, { feedbackContent, questionId })

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.refetchQueries(['feedbackTargetFeedbacks', String(feedbackTarget.id)])
    },
  })

  const canDelete = isAdmin

  const deleteAnswer = async feedback => {
    if (!canDelete || !(window.prompt(t('feedbackTargetResults:confirmDeleteFeedback')) === 'delete')) return

    try {
      await mutation.mutateAsync({
        feedbackContent: feedback.data,
        questionId: feedback.questionId,
      })
      enqueueSnackbar(t('feedbackTargetResults:deleteSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return {
    canDelete,
    deleteAnswer,
  }
}

export default useDeleteOpenFeedback
