import React, { useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Formik, Form, useField } from 'formik'

import {
  Card,
  CardContent,
  Box,
  CircularProgress,
  Typography,
  Divider,
  Button,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../FormikTextField'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import AlertLink from '../AlertLink'
import Alert from '../Alert'
import Markdown from '../Markdown'
import apiClient from '../../util/apiClient'
import PublicQuestions from '../PublicQuestions'
import ResponseEmailButton from './ResponseEmailButton'
import { getCoursePeriod } from './utils'

const getInitialValues = (feedbackTarget) => ({
  feedbackResponse: feedbackTarget.feedbackResponse ?? '',
})

const saveValues = async (values, feedbackTargetId) => {
  const { feedbackResponse } = values

  const { data } = await apiClient.put(
    `/feedback-targets/${feedbackTargetId}/reply`,
    {
      data: feedbackResponse,
    },
  )

  return data
}

const MarkdownPreview = () => {
  const [field] = useField('feedbackResponse')

  const { value } = field

  return <Markdown>{value}</Markdown>
}

const FeedbackResponse = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  const [currentResponse, setCurrentResponse] = useState('')

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

  const initialValues = getInitialValues(feedbackTarget)

  const handleSubmit = async (values) => {
    try {
      await saveValues(values, feedbackTarget.id)
      setCurrentResponse(values.feedbackResponse)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const checkFeedbackIsSaved = (isSubmitting, values) => {
    if (isSubmitting) return true
    if (values.feedbackResponse === feedbackTarget.feedbackResponse) return true
    if (values.feedbackResponse === currentResponse) return true
    return false
  }

  const coursePeriod =
    feedbackTarget && getCoursePeriod(feedbackTarget.courseRealisation)

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {courseUnitName}
        </Typography>
        <Typography variant="body2" component="p">
          {coursePeriod}
        </Typography>
      </Box>
      <PublicQuestions />
      <Card>
        <CardContent>
          <Box mb={2}>
            <Alert severity="info">
              <Trans i18nKey="feedbackResponse:responseInfo">
                This field supports{' '}
                <AlertLink href="https://commonmark.org/help/" target="_blank">
                  Markdown
                </AlertLink>{' '}
                syntax
              </Trans>
            </Alert>
          </Box>

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validateOnChange={false}
          >
            {({ isSubmitting, values }) => (
              <Form>
                <FormikTextField
                  label={t('feedbackResponse:responseLabel')}
                  name="feedbackResponse"
                  rows={10}
                  fullWidth
                  multiline
                />
                <Box my={2}>
                  <Button
                    disabled={checkFeedbackIsSaved(isSubmitting, values)}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    {t('save')}
                  </Button>
                  {'  '}
                  <ResponseEmailButton 
                    disabled={!checkFeedbackIsSaved(false, values) || feedbackTarget.feedbackResponseEmailSent} 
                    feedbackTargetId={feedbackTarget.id}
                  />
                </Box>
                <Box my={2}>
                  <Divider />
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">
                    {t('feedbackResponse:previewLabel')}
                  </Typography>
                </Box>
                <MarkdownPreview />
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </>
  )
}

export default FeedbackResponse
