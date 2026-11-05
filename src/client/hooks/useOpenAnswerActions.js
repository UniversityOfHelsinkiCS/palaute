import { useMutation } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import apiClient from '../util/apiClient'
import queryClient from '../util/queryClient'
import { useTranslationContext } from '../util/translationContext'

const useOpenAnswerActions = ({ hidePath, deletePath, queryKey, canHide, canDelete }) => {
  const { t } = useTranslation()
  const context = useTranslationContext()
  const { enqueueSnackbar } = useSnackbar()

  const queryKeyJson = JSON.stringify(queryKey)
  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey: JSON.parse(queryKeyJson) }),
    [queryKeyJson]
  )

  const { mutateAsync: hide } = useMutation({
    mutationFn: async body => (await apiClient.put(hidePath, body)).data,
  })
  const { mutateAsync: remove } = useMutation({
    mutationFn: async body => (await apiClient.put(deletePath, body)).data,
  })

  const toggleVisibility = useCallback(
    async feedback => {
      const hidden = !feedback.hidden
      try {
        const { count } = await hide({ feedbackContent: feedback.data, questionId: feedback.questionId, hidden })
        if (count > 0) {
          const options = { count, content: feedback.data.slice(0, 20) }
          enqueueSnackbar(
            hidden ? t('feedbackTargetResults:hideSuccess', options) : t('feedbackTargetResults:showSuccess', options),
            { variant: 'info' }
          )
          await refetch()
        }
      } catch {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    },
    [hide, refetch, enqueueSnackbar, t]
  )

  const deleteAnswer = useCallback(
    async feedback => {
      if (!canDelete || window.prompt(t('feedbackTargetResults:confirmDeleteFeedback', { context })) !== 'delete') {
        return
      }
      try {
        const { count } = await remove({ feedbackContent: feedback.data, questionId: feedback.questionId })
        await refetch()
        enqueueSnackbar(t('feedbackTargetResults:deleteSuccess', { content: feedback.data, count }), {
          variant: 'success',
        })
      } catch {
        enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
      }
    },
    [canDelete, remove, refetch, enqueueSnackbar, t, context]
  )

  return useMemo(
    () => ({ canHide, toggleVisibility, canDelete, deleteAnswer }),
    [canHide, toggleVisibility, canDelete, deleteAnswer]
  )
}

export default useOpenAnswerActions
