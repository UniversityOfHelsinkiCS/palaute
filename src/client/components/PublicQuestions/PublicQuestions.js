import React from 'react'

import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core'

import { useParams, Redirect, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import AlertLink from '../AlertLink'
import QuestionSelection from './QuestionSelection'

const PublicQuestions = () => {
  const { id } = useParams()
  const { i18n } = useTranslation()
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

  const courseUnitName = getLanguageValue(
    feedbackTarget.courseUnit?.name,
    i18n.language,
  )

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {courseUnitName}
        </Typography>
      </Box>
      <Card>
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
