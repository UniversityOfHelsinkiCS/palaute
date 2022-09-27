import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormGroup,
  FormControlLabel,
} from '@mui/material'
import { useMutation } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'

const updateContinuousFeedbackStatus = async ({
  id,
  continuousFeedbackEnabled,
}) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    continuousFeedbackEnabled,
  })

  return data
}

const ContinuousFeedbackSettings = ({ feedbackTarget }) => {
  const { continuousFeedbackEnabled, id } = feedbackTarget
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useMutation(updateContinuousFeedbackStatus)

  const [feedbackEnabled, setFeedbackEnabled] = useState(
    continuousFeedbackEnabled,
  )

  const handleChange = async () => {
    try {
      await mutation.mutateAsync({
        id,
        continuousFeedbackEnabled: !feedbackEnabled,
      })
      setFeedbackEnabled(!feedbackEnabled)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box mb={5}>
      <Card>
        <CardContent>
          <Box mb={4}>
            <Typography variant="h6">
              {t('feedbackTargetView:continuousFeedbackTab')}
            </Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={feedbackEnabled}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={t('feedbackTargetView:activateContinuousFeedback')}
            />
          </FormGroup>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ContinuousFeedbackSettings
