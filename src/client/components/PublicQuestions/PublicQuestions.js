import React, { useEffect, useState } from 'react'

import { Card, CardContent, Box, Typography, Alert } from '@mui/material'

import { useParams, Redirect, Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'

import AlertLink from '../AlertLink'
import QuestionSelection from './QuestionSelection'
import PublicitySelection from './PublicitySelection'

const PublicQuestions = ({ feedbackTarget }) => {
  const [visibility, setVisibility] = useState('ALL')
  const { t } = useTranslation()
  const { id } = useParams()

  useEffect(() => {
    setVisibility(feedbackTarget.feedbackVisibility)
  }, [])

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  return (
    <Card style={{ marginBottom: 10 }}>
      <CardContent>
        <Box mb={4}>
          <Typography variant="h6">{t('publicQuestions:title')}</Typography>
        </Box>
        <Box mb={2}>
          <Alert severity="info">
            <Trans i18nKey="publicQuestions:publicInfo">
              Feedback related to public questions is visible to students on the{' '}
              <AlertLink component={Link} to={`/targets/${id}/results`}>
                feedback page
              </AlertLink>{' '}
              once the feedback period has ended
            </Trans>
          </Alert>
        </Box>
        <PublicitySelection
          visibility={visibility}
          setVisibility={setVisibility}
        />
        <QuestionSelection
          feedbackTarget={feedbackTarget}
          visibility={visibility}
        />
      </CardContent>
    </Card>
  )
}

export default PublicQuestions
