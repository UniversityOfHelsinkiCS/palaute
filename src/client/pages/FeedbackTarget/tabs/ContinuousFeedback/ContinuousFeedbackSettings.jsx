import React from 'react'
import { Box, Switch, FormGroup, FormControlLabel, Alert } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'
import CardSection from '../../../../components/common/CardSection'
import { switchFocusIndicatorStyle } from '../../../../util/accessibility'

const updateContinuousFeedbackStatus = async ({ id, continuousFeedbackEnabled, sendContinuousFeedbackDigestEmail }) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
  })

  return data
}

const ContinuousFeedbackSettings = ({ feedbackTarget }) => {
  const { id, sendContinuousFeedbackDigestEmail } = feedbackTarget
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useMutation({
    mutationFn: updateContinuousFeedbackStatus,
    onMutate: async variables => {
      const queryKey = ['feedbackTarget', String(id)]

      await queryClient.cancelQueries(queryKey)

      const previousFeedbackTarget = queryClient.getQueryData(queryKey)

      // Optimistic cache update to make toggle more responsive
      queryClient.setQueryData(queryKey, current => {
        if (!current) return current

        const updates = {}

        if (typeof variables.continuousFeedbackEnabled === 'boolean') {
          updates.continuousFeedbackEnabled = variables.continuousFeedbackEnabled
        }

        if (typeof variables.sendContinuousFeedbackDigestEmail === 'boolean') {
          updates.sendContinuousFeedbackDigestEmail = variables.sendContinuousFeedbackDigestEmail
        }

        return { ...current, ...updates }
      })

      return { previousFeedbackTarget }
    },
    onError: (_error, _variables, context) => {
      const queryKey = ['feedbackTarget', String(id)]

      if (context?.previousFeedbackTarget) {
        queryClient.setQueryData(queryKey, context.previousFeedbackTarget)
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries(['feedbackTarget', String(id)])
    },
  })

  const feedbackEnabled = Boolean(feedbackTarget.continuousFeedbackEnabled)
  const sendDigestEmail = Boolean(sendContinuousFeedbackDigestEmail)

  const handleFeedbackEnabledChange = async () => {
    const nextEnabled = !feedbackEnabled
    try {
      await mutation.mutateAsync({
        id,
        continuousFeedbackEnabled: nextEnabled,
      })
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const handleSendDigestEmailChange = async () => {
    const nextSendDigestEmail = !sendDigestEmail
    try {
      await mutation.mutateAsync({
        id,
        sendContinuousFeedbackDigestEmail: nextSendDigestEmail,
      })
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
              sx={switchFocusIndicatorStyle}
              disableRipple
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
              sx={switchFocusIndicatorStyle}
              disableRipple
            />
          }
          label={t('feedbackTargetView:activateContinuousFeedbackDigest')}
        />
      </FormGroup>
    </CardSection>
  )
}

export default ContinuousFeedbackSettings
