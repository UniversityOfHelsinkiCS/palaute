import React from 'react'
import { useParams } from 'react-router'
import { Box, Typography, Alert } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import { saveContinuousFeedback } from './utils'
import { NorButton } from '../../../../components/common/NorButton'
import { ConsentCheckbox } from '../FeedbackView/ConsentCheckbox'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import queryClient from '../../../../util/queryClient'

const styles = {
  description: {
    width: '80%',
    marginTop: 2.5,
    marginBottom: 2,
  },
  button: {
    width: 'fit-content',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}

const ContinuousFeedbackForm = ({ fewEnrolled }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget } = useFeedbackTargetContext()

  const { id } = useParams()
  const preamble = feedbackTarget?.continuousFeedbackPreamble?.trim()

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await saveContinuousFeedback(values, id)
      resetForm()
      queryClient.invalidateQueries(['feedbackTargetContinuousFeedbacks'])
      enqueueSnackbar(t('norppaFeedback:successAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const smallCourseInfo = fewEnrolled
    ? `\n\n${t('userFeedbacks:attention')} ${t('userFeedbacks:smallCourseWarning', { count: FEEDBACK_HIDDEN_STUDENT_COUNT })}`
    : ''

  return (
    <Box mb={2}>
      <Box sx={{ mb: 2 }} data-cy="continuousFeedbackPreambleDisplay">
        <Alert severity="info">
          <Typography variant="body2" component="p" sx={{ whiteSpace: 'pre-line' }}>
            {`${t('feedbackView:continuousFeedbackInfo')}${smallCourseInfo}`}
          </Typography>
        </Alert>
      </Box>
      {preamble && (
        <Typography variant="body1" component="p" sx={styles.description}>
          {preamble}
        </Typography>
      )}
      <Formik initialValues={{ feedback: '', activateSubmit: false }} onSubmit={handleSubmit}>
        {({ values, isSubmitting, setFieldValue }) => (
          <Form sx={styles.container}>
            <FormikTextField name="feedback" label={t('norppaFeedback:feedback')} fullWidth minRows={4} multiline />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: '1rem' }}>
              {fewEnrolled && (
                <ConsentCheckbox
                  dataCy="continuous-feedback-consent-checkbox"
                  label={t('feedbackView:allowSubmitCheckbox', {
                    count: FEEDBACK_HIDDEN_STUDENT_COUNT,
                  })}
                  handleChange={setFieldValue}
                />
              )}
              <NorButton
                type="submit"
                color="primary"
                disabled={!values.feedback.length || isSubmitting || (fewEnrolled && !values.activateSubmit)}
                sx={styles.button}
              >
                {t('norppaFeedback:submit')}
              </NorButton>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ContinuousFeedbackForm
