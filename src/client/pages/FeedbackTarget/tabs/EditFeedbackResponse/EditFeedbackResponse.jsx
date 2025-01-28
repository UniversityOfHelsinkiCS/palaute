import React, { useState } from 'react'
import { Formik, Form, useField } from 'formik'

import { Card, CardContent, Box, Typography, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import AlertLink from '../../../../components/common/AlertLink'
import Markdown from '../../../../components/common/Markdown'
import ResponseEmailButton from './ResponseEmailButton'
import useUpdateFeedbackResponse from './useUpdateFeedbackResponse'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import Instructions from '../../../../components/common/Instructions'
import useFeedbackTargetId from '../../useFeedbackTargetId'

const getInitialValues = feedbackTarget => ({
  feedbackResponse: feedbackTarget.feedbackResponse ?? '',
})

const MarkdownPreview = () => {
  const [field] = useField('feedbackResponse')

  const { value } = field

  return <Markdown>{value}</Markdown>
}

const EditFeedbackResponse = () => {
  const id = useFeedbackTargetId()

  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const [sendEmail, setSendEmail] = useState(true)

  const { feedbackTarget } = useFeedbackTargetContext()
  const updateFeedbackResponse = useUpdateFeedbackResponse()

  const initialValues = getInitialValues(feedbackTarget)
  const isSent = feedbackTarget.feedbackResponseEmailSent

  const { closesAt } = feedbackTarget

  const now = Date.now()
  const closeTime = Date.parse(closesAt)
  const feedbackResponseFormDisabled = now < closeTime

  const handleSubmit = async values => {
    values.feedbackResponseEmailSent = !isSent && sendEmail

    try {
      await updateFeedbackResponse.mutateAsync({
        id,
        data: values,
      })
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (err) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return (
    <Card>
      <CardContent>
        <Instructions title={t('feedbackResponse:instructionTitle')}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">{t('feedbackResponse:responseInstruction')}</Typography>
            <Typography variant="body2">{t('feedbackResponse:writingInstruction')}</Typography>
          </Box>
        </Instructions>
        <Box mb={2}>
          <Alert severity="info">
            <Trans i18nKey="feedbackResponse:responseInfo">
              This field supports{' '}
              <AlertLink href={t('links:markdownHelp')} target="_blank">
                Markdown
              </AlertLink>{' '}
              syntax
            </Trans>
          </Alert>
        </Box>
        <Formik initialValues={initialValues} validateOnChange={false} onSubmit={handleSubmit}>
          {({ isSubmitting, values }) => {
            const edited = values.feedbackResponse !== feedbackTarget.feedbackResponse
            return (
              <Form id="feedback-response-form">
                <FormikTextField
                  label={
                    feedbackResponseFormDisabled
                      ? t('feedbackResponse:formDisabled')
                      : t('feedbackResponse:responseLabel')
                  }
                  name="feedbackResponse"
                  minRows={10}
                  fullWidth
                  multiline
                  disabled={feedbackResponseFormDisabled}
                />
                <Box my={2} display="flex">
                  <ResponseEmailButton
                    sendEmail={!isSent && sendEmail}
                    disabled={
                      (!edited && !sendEmail) || (!edited && isSent) || isSubmitting || !values.feedbackResponse
                    }
                    onSubmit={() => handleSubmit(values)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy="feedback-response-send-email-checkbox"
                        color="primary"
                        checked={sendEmail || isSent}
                        disabled={isSent}
                        onChange={({ target }) => setSendEmail(target.checked)}
                      />
                    }
                    label={isSent ? t('feedbackResponse:emailSent') : t('feedbackResponse:checkboxSendEmail')}
                  />
                </Box>
                <Box my={2}>
                  <Divider />
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">{t('feedbackResponse:previewLabel')}</Typography>
                </Box>
                <MarkdownPreview />
              </Form>
            )
          }}
        </Formik>
      </CardContent>
    </Card>
  )
}

export default EditFeedbackResponse
