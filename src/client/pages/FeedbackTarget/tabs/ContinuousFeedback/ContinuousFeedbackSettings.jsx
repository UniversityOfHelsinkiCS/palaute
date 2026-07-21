import React, { useEffect, useState } from 'react'
import { Box, Switch, FormGroup, FormControlLabel, Alert, TextField } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import apiClient from '../../../../util/apiClient'
import queryClient from '../../../../util/queryClient'
import CardSection from '../../../../components/common/CardSection'
import { switchFocusIndicatorStyle } from '../../../../util/accessibility'
import { NorButton } from '../../../../components/common/NorButton'

const updateContinuousFeedbackStatus = async ({
  id,
  continuousFeedbackEnabled,
  sendContinuousFeedbackDigestEmail,
  continuousFeedbackPreamble,
}) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
    continuousFeedbackPreamble,
  })

  return data
}

const ContinuousFeedbackSettings = ({ feedbackTarget }) => {
  const { id, sendContinuousFeedbackDigestEmail } = feedbackTarget
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [preamble, setPreamble] = useState(feedbackTarget.continuousFeedbackPreamble ?? '')

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

        if (typeof variables.continuousFeedbackPreamble === 'string' || variables.continuousFeedbackPreamble === null) {
          updates.continuousFeedbackPreamble = variables.continuousFeedbackPreamble
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
  })

  const feedbackEnabled = Boolean(feedbackTarget.continuousFeedbackEnabled)
  const sendDigestEmail = Boolean(sendContinuousFeedbackDigestEmail)

  useEffect(() => {
    setPreamble(feedbackTarget.continuousFeedbackPreamble ?? '')
  }, [feedbackTarget.continuousFeedbackPreamble])

  const handleFeedbackEnabledChange = async () => {
    const nextEnabled = !feedbackEnabled
    try {
      await mutation.mutateAsync({
        id,
        continuousFeedbackEnabled: nextEnabled,
      })
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch {
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
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const handlePreambleChange = event => {
    setPreamble(event.target.value)
  }

  const handlePreambleSave = async () => {
    if (!feedbackEnabled) return

    const currentPreamble = feedbackTarget.continuousFeedbackPreamble ?? ''
    if (preamble === currentPreamble) return

    try {
      await mutation.mutateAsync({
        id,
        continuousFeedbackPreamble: preamble,
      })
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const isPreambleDirty = preamble !== (feedbackTarget.continuousFeedbackPreamble ?? '')
  const isSaving = mutation.isPending ?? mutation.isLoading ?? false

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
        <Box mt={2}>
          <TextField
            label={t('feedbackTargetView:continuousFeedbackPreambleLabel')}
            helperText={t('feedbackTargetView:continuousFeedbackPreambleHelp')}
            value={preamble}
            onChange={handlePreambleChange}
            fullWidth
            minRows={3}
            multiline
            disabled={!feedbackEnabled}
            data-cy="continuousFeedbackPreamble"
          />
          <Box display="flex" justifyContent="flex-end">
            <NorButton
              color="primary"
              onClick={handlePreambleSave}
              disabled={!feedbackEnabled || !isPreambleDirty || isSaving}
              data-cy="saveContinuousFeedbackPreamble"
            >
              {t('common:save')}
            </NorButton>
          </Box>
        </Box>
      </FormGroup>
    </CardSection>
  )
}

export default ContinuousFeedbackSettings
