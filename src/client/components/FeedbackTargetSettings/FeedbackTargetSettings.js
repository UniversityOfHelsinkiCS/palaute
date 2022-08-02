import { useSnackbar } from 'notistack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useHistory, useParams } from 'react-router'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import FeedbackPeriodForm from './FeedbackPeriodForm'
import {
  getFeedbackPeriodInitialValues,
  openFeedbackImmediately,
  opensAtIsImmediately,
  saveFeedbackPeriodValues,
} from './utils'
import { LoadingProgress } from '../LoadingProgress'
import PublicQuestions from '../PublicQuestions'
import useUpdateSettingsRead from './useUpdateSettingsRead'

const FeedbackTargetSettings = () => {
  const { id } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateSettingsRead = useUpdateSettingsRead()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  useEffect(() => {
    if (isLoading || feedbackTarget.settingsReadByTeacher) return
    updateSettingsRead.mutateAsync({ id })
  }, [isLoading])

  if (isLoading) {
    return <LoadingProgress />
  }

  const handleOpenFeedbackImmediately = async () => {
    try {
      await openFeedbackImmediately(feedbackTarget)
      history.replace(`/targets/${id}`)
      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleSubmitFeedbackPeriod = async (values) => {
    try {
      await saveFeedbackPeriodValues(values, feedbackTarget)

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })

      if (opensAtIsImmediately(values)) {
        history.replace(`/targets/${id}`)
      }

      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const feedbackPeriodInitialValues =
    getFeedbackPeriodInitialValues(feedbackTarget)

  return (
    <>
      <FeedbackPeriodForm
        onSubmit={handleSubmitFeedbackPeriod}
        initialValues={feedbackPeriodInitialValues}
        onOpenImmediately={handleOpenFeedbackImmediately}
        feedbackTarget={feedbackTarget}
      />
      <PublicQuestions target={feedbackTarget} type="feedback-targets" />
    </>
  )
}

export default FeedbackTargetSettings
