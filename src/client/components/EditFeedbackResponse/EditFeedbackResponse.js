import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Formik, Form, useField } from 'formik'

import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Button,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { differenceInMonths } from 'date-fns'

import FormikTextField from '../FormikTextField'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import AlertLink from '../AlertLink'
import Alert from '../Alert'
import Markdown from '../Markdown'
import ResponseEmailButton from './ResponseEmailButton'
import InstructionAccordion from './InstructionAccordion'
import { LoadingProgress } from '../LoadingProgress'
import useUpdateFeedbackResponse from './useUpdateFeedbackResponse'

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

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })
  const updateFeedbackResponse = useUpdateFeedbackResponse()

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const initialValues = getInitialValues(feedbackTarget)

  const { closesAt } = feedbackTarget

  const now = Date.now()
  const closeTime = Date.parse(closesAt)
  const feedbackResponseFormDisabled =
    now < closeTime || differenceInMonths(now, closeTime) > 6

  const handleSubmit = async (values) => {
    try {
      await updateFeedbackResponse.mutateAsync({
        id,
        data: values,
      })
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
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
                    isSent={feedbackTarget.feedbackResponseEmailSent}
                    disabled={isSubmitting || !values.feedbackResponse}
                    onSubmit={() =>
                      handleSubmit({
                        ...values,
                        feedbackResponseEmailSent: true,
                      })
                    }
                  />
                  <Button
                    color="primary"
                    onClick={() =>
                      handleSubmit({
                        ...values,
                        feedbackResponseEmailSent: false,
                      })
                    }
                  >
                    {t('feedbackResponse:dialogSaveSubmit')}
                  </Button>
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
