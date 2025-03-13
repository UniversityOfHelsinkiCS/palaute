import React, { useState } from 'react'
import { Box, Switch, FormGroup, FormControlLabel, Alert } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import apiClient from '../../../../util/apiClient'
import CardSection from '../../../../components/common/CardSection'

const updateContinuousFeedbackStatus = async ({ id, continuousFeedbackEnabled, sendContinuousFeedbackDigestEmail }) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
  })

  return data
}

const ContinuousFeedbackSettings = ({ feedbackTarget, feedbackEnabled, setFeedbackEnabled }) => {
  const { id, sendContinuousFeedbackDigestEmail } = feedbackTarget
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useMutation({
    mutationFn: updateContinuousFeedbackStatus,
  })

  const [sendDigestEmail, setSendDigestEmail] = useState(sendContinuousFeedbackDigestEmail)

  const handleFeedbackEnabledChange = async () => {
    try {
      await mutation.mutateAsync({
        id,
        continuousFeedbackEnabled: !feedbackEnabled,
      })
      setFeedbackEnabled(!feedbackEnabled)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const handleSendDigestEmailChange = async () => {
    try {
      await mutation.mutateAsync({
        id,
        sendContinuousFeedbackDigestEmail: !sendDigestEmail,
      })
      setSendDigestEmail(!sendDigestEmail)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return (
    <CardSection title={t('feedbackTargetView:continuousFeedbackTab')}>
      <Box mb={2}>
        <Alert severity="info">{t('feedbackTargetView:continuousFeedbackInfo')}</Alert>
      </Box>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={feedbackEnabled}
              onChange={handleFeedbackEnabledChange}
              color="primary"
              data-cy="activateContinuousFeedback"
            />
          }
          label={t('feedbackTargetView:activateContinuousFeedback')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={sendDigestEmail}
              disabled={!feedbackEnabled}
              onChange={handleSendDigestEmailChange}
              color="primary"
            />
          }
          label={t('feedbackTargetView:activateContinuousFeedbackDigest')}
        />
      </FormGroup>
    </CardSection>
  )
}

export default ContinuousFeedbackSettings
