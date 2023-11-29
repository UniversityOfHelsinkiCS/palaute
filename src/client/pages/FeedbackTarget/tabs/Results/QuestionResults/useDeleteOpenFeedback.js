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

  const mutationFn = async ({ feedbackId, questionId }) =>
    apiClient.delete(`/feedbacks/${feedbackId}/question/${questionId}`)

  const mutation = useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.refetchQueries(['feedbackTargetFeedbacks', String(feedbackTarget.id)])
    },
  })

  const canDelete = isAdmin

  const deleteAnswer = async feedback => {
    // eslint-disable-next-line no-alert
    if (!canDelete || !(window.prompt(t('feedbackTargetResults:confirmDeleteFeedback')) === 'delete')) return

    try {
      await mutation.mutateAsync({
        feedbackId: feedback.feedbackId,
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
