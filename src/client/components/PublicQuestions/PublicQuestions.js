import React, { useEffect, useState } from 'react'

import { Card, CardContent, Box } from '@material-ui/core'

import { useParams, Redirect, Link } from 'react-router-dom'
import { Trans } from 'react-i18next'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import Alert from '../Alert'
import AlertLink from '../AlertLink'
import QuestionSelection from './QuestionSelection'
import PublicitySelection from './PublicitySelection'
import { LoadingProgress } from '../LoadingProgress'

const PublicQuestions = () => {
  const [visibility, setVisibility] = useState('ALL')

  const { id } = useParams()

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  useEffect(() => {
    if (!isLoading) {
      setVisibility(feedbackTarget.feedbackVisibility)
    }
  }, [])

  if (isLoading) {
    return <LoadingProgress />
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
    </>
  )
}

export default PublicQuestions
