import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

/**
 * For SUPERADMIN deleting continuous feedbacks. Gets the feedback target from FeedbackTargetContext,
 * meaning it can only be used in the context
 */
const useDeleteContinuousFeedback = () => {
  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutationFn = async ({ continuousFeedbackId }) =>
    apiClient.delete(`/continuous-feedback/${feedbackTarget.id}/${continuousFeedbackId}`)

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.refetchQueries(['feedbackTargetContinuousFeedbacks', String(feedbackTarget.id)])
    },
  })

  const canDelete = isAdmin

  const deleteAnswer = async continuousFeedbackId => {
    if (!canDelete || !(window.prompt(t('feedbackTargetResults:confirmDeleteFeedback')) === 'delete')) return

    try {
      await mutation.mutateAsync({
        continuousFeedbackId,
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

export default useDeleteContinuousFeedback
