import React, { useEffect, useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Formik, Form, useField } from 'formik'

import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { differenceInMonths } from 'date-fns'

import FormikTextField from '../FormikTextField'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import AlertLink from '../AlertLink'
import Alert from '../Alert'
import Markdown from '../Markdown'
import apiClient from '../../util/apiClient'
import ResponseEmailButton from './ResponseEmailButton'
import InstructionAccordion from './InstructionAccordion'
import { LoadingProgress } from '../LoadingProgress'

const getInitialValues = (feedbackTarget) => ({
  feedbackResponse: feedbackTarget.feedbackResponse ?? '',
})

const MarkdownPreview = () => {
  const [field] = useField('feedbackResponse')

  const { value } = field

  return <Markdown>{value}</Markdown>
}

const EditFeedbackResponse = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { feedbackTarget, isLoading, refetch } = useFeedbackTarget(id, {
    skipCache: true,
  })

  const [sendEmail, setSendEmail] = useState(true)
  useEffect(() => {
    setSendEmail(
      Boolean(
        feedbackTarget &&
          !feedbackTarget.feedbackResponse &&
          !feedbackTarget.feedbackResponseEmailSent,
      ),
    )
  }, [feedbackTarget])

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const initialValues = getInitialValues(feedbackTarget)

  const { feedbackResponseEmailSent, closesAt } = feedbackTarget

  const hideResponseForm = feedbackResponseEmailSent
  if (hideResponseForm) {
    return <Redirect to={`/targets/${feedbackTarget.id}/results`} />
  }

  const now = Date.now()
  const closeTime = Date.parse(closesAt)
  const feedbackResponseFormDisabled =
    feedbackResponseEmailSent ||
    now < closeTime ||
    differenceInMonths(now, closeTime) > 6

  const handleSubmit = async (values) => {
    try {
      await apiClient.put(`/feedback-targets/${feedbackTarget.id}/response`, {
        data: {
          feedbackResponse: values.feedbackResponse,
          feedbackResponseEmailSent: sendEmail,
        },
      })
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
      if (sendEmail) {
        refetch()
      }
    } catch (err) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <InstructionAccordion />
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
            validateOnChange={false}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form id="feedback-response-form">
                <FormikTextField
                  label={
                    feedbackResponseFormDisabled
                      ? t('feedbackResponse:formDisabled')
                      : t('feedbackResponse:responseLabel')
                  }
                  name="feedbackResponse"
                  rows={10}
                  fullWidth
                  multiline
                  disabled={feedbackResponseFormDisabled}
                />
                <Box my={2} display="flex">
                  <ResponseEmailButton
                    disabled={
                      isSubmitting ||
                      feedbackTarget.feedbackResponseEmailSent ||
                      !values.feedbackResponse
                    }
                    feedbackTargetId={feedbackTarget.id}
                    values={{ ...values, sendEmail }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sendEmail}
                        onChange={() => setSendEmail(!sendEmail)}
                        disabled={feedbackResponseFormDisabled}
                      />
                    }
                    label={t('feedbackResponse:sendEmailOption')}
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

export default EditFeedbackResponse
