import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useHistory, useParams } from 'react-router'

import FeedbackPeriodForm from './FeedbackPeriodForm'
import {
  getFeedbackPeriodInitialValues,
  openFeedbackImmediately,
  opensAtIsImmediately,
  saveFeedbackPeriodValues,
} from './utils'
import useUpdateSettingsRead from './useUpdateSettingsRead'
import ContinuousFeedbackSettings from './ContinuousFeedbackSettings'
import EditFeedbackTarget from './EditFeedbackTarget'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

const Settings = () => {
  const { id } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateSettingsRead = useUpdateSettingsRead()
  const { feedbackTarget, isResponsibleTeacher, isAdmin } = useFeedbackTargetContext()

  useEffect(() => {
    if (feedbackTarget.settingsReadByTeacher || !isResponsibleTeacher || isAdmin) {
      return
    }
    updateSettingsRead.mutateAsync({ id })
  }, [])

  const handleOpenFeedbackImmediately = async () => {
    try {
      await openFeedbackImmediately(feedbackTarget)
      history.replace(`/targets/${id}`)
      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleSubmitFeedbackPeriod = async values => {
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

  const feedbackPeriodInitialValues = getFeedbackPeriodInitialValues(feedbackTarget)

  return (
    <>
      <FeedbackPeriodForm
        onSubmit={handleSubmitFeedbackPeriod}
        initialValues={feedbackPeriodInitialValues}
        onOpenImmediately={handleOpenFeedbackImmediately}
        feedbackTarget={feedbackTarget}
      />
      <ContinuousFeedbackSettings feedbackTarget={feedbackTarget} />
      <EditFeedbackTarget />
    </>
  )
}

export default Settings
