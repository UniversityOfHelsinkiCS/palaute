import { Card, CardContent, Box, Typography, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material'
import { Formik, Form, useField } from 'formik'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AlertLink from '../../../../components/common/AlertLink'
import FormikTextField from '../../../../components/common/FormikTextField'
import Instructions from '../../../../components/common/Instructions'
import Markdown from '../../../../components/common/Markdown'
import { optionFocusIndicatorStyle } from '../../../../util/accessibility'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import ResponseEmailButton from './ResponseEmailButton'
import useUpdateFeedbackResponse from './useUpdateFeedbackResponse'

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
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return (
    <Card id="feedback-target-tab-content">
      <CardContent>
        <Instructions title={t('feedbackResponse:instructionTitle')}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">{t('feedbackResponse:responseInstruction')}</Typography>
            <Typography variant="body2">{t('feedbackResponse:writingInstruction')}</Typography>
          </Box>
        </Instructions>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            {t('feedbackResponse:responseInfo')}{' '}
            <AlertLink href={t('links:markdownHelp')} target="_blank">
              {t('feedbackResponse:markdownLink')}
            </AlertLink>
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
                <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy="feedback-response-send-email-checkbox"
                        color="primary"
                        checked={sendEmail || isSent}
                        disabled={isSent}
                        onChange={({ target }) => setSendEmail(target.checked)}
                        disableFocusRipple
                      />
                    }
                    label={isSent ? t('feedbackResponse:emailSent') : t('feedbackResponse:checkboxSendEmail')}
                    sx={{ ml: 0, pr: 1, ...optionFocusIndicatorStyle() }}
                  />
                  <ResponseEmailButton
                    sendEmail={!isSent && sendEmail}
                    disabled={
                      (!edited && !sendEmail) || (!edited && isSent) || isSubmitting || !values.feedbackResponse
                    }
                    onSubmit={() => handleSubmit(values)}
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
