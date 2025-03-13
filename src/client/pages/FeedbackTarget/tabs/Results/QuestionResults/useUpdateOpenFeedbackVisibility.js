import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
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

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response, { feedbackContent }) => {
      const { hidden, count } = response.data

      enqueueSnackbar(
        hidden
          ? t('feedbackTargetResults:hideSuccess', { count, content: feedbackContent.slice(0, 20) })
          : t('feedbackTargetResults:showSuccess', { count, content: feedbackContent.slice(0, 20) }),
        { variant: 'info' }
      )

      queryClient.invalidateQueries(['feedbackTargetFeedbacks', String(feedbackTarget.id)])
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
