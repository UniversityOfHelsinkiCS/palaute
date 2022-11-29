import React from 'react'
import { Card, CardContent, Box, Typography, Alert } from '@mui/material'
import { Redirect } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'

import QuestionSelection from './QuestionSelection'

const PublicQuestions = ({ organisation }) => {
  const { t } = useTranslation()

  if (!organisation) {
    return <Redirect to="/" />
  }

  return (
    <Box mb={5}>
      <Card sx={{ marginTop: '1rem' }} elevation={3}>
        <CardContent>
          <Box mb={4}>
            <Typography variant="h6">{t('publicQuestions:title')}</Typography>
          </Box>
          <Box mb={2}>
            <Alert severity="info">
              <Trans i18nKey="publicQuestions:publicInfo">
                Feedback related to public questions is visible to students on
                the feedback page once the feedback period has ended
              </Trans>
            </Alert>
          </Box>
          <QuestionSelection organisation={organisation} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default PublicQuestions
