import React from 'react'

import { Card, CardContent, Box, CircularProgress } from '@material-ui/core'

import { useParams, Redirect, Link } from 'react-router-dom'
import { Trans } from 'react-i18next'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import Alert from '../Alert'
import AlertLink from '../AlertLink'
import QuestionSelection from './QuestionSelection'

const PublicQuestions = () => {
  const { id } = useParams()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id, { cacheTime: 0 })

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  return (
    <>
      <Card style={{ marginBottom: 10 }}>
        <CardContent>
          <Box mb={2}>
            <Alert severity="info">
              <Trans i18nKey="publicQuestions:publicInfo">
                Feedback related to public questions is visible to students on
                the{' '}
                <AlertLink component={Link} to={`/targets/${id}/results`}>
                  feedback page
                </AlertLink>{' '}
                once the feedback period has ended
              </Trans>
            </Alert>
          </Box>
          <QuestionSelection feedbackTarget={feedbackTarget} />
        </CardContent>
      </Card>
    </>
  )
}

export default PublicQuestions
