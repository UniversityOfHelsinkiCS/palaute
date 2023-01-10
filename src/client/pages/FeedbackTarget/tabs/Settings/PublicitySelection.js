import React from 'react'
import { Box, Card, CardContent, Typography, Select, MenuItem, FormControl, FormHelperText } from '@mui/material'

import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useSnackbar } from 'notistack'

import apiClient from '../../../../util/apiClient'

const updateFeedbackPublicity = async ({ id, feedbackVisibility }) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    feedbackVisibility,
  })

  return data
}

const PublicitySelection = ({ visibility, setVisibility }) => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const mutation = useMutation(updateFeedbackPublicity)

  const handleChange = async e => {
    try {
      await mutation.mutateAsync({
        id,
        feedbackVisibility: e.target.value,
      })
      setVisibility(e.target.value)
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
            <Typography variant="h6">{t('publicQuestions:title')}</Typography>
          </Box>
          <FormControl>
            <Select value={visibility} onChange={handleChange}>
              <MenuItem value="ENROLLED">{t('publicQuestions:enrolled')}</MenuItem>
              <MenuItem value="ALL">{t('publicQuestions:everyone')}</MenuItem>
            </Select>
            <FormHelperText>{t('publicQuestions:selectVisibility')}</FormHelperText>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PublicitySelection
