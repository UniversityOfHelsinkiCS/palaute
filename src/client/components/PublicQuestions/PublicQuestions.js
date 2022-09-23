import React, { useEffect, useState } from 'react'

import { Card, CardContent, Box, Typography, Alert } from '@mui/material'

import { Redirect } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'

import QuestionSelection from './QuestionSelection'
import PublicitySelection from './PublicitySelection'

const PublicQuestions = ({ type = 'feedback-targets', target }) => {
  const [visibility, setVisibility] = useState('ALL')
  const { t } = useTranslation()

  useEffect(() => {
    setVisibility(target.feedbackVisibility)
  }, [])

  if (!target) {
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
          {target.feedbackVisibility && (
            <PublicitySelection
              visibility={visibility}
              setVisibility={setVisibility}
            />
          )}
          <QuestionSelection
            resource={type}
            target={target}
            visibility={visibility}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default PublicQuestions
