import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Box, Typography, Alert } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import { saveContinuousFeedback } from './utils'
import { NorButton } from '../../../../components/common/NorButton'
import { ConsentCheckbox } from './ConsentCheckbox'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

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

const ContinuousFeedback = ({ fewEnrolled }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const { feedbackTarget } = useFeedbackTargetContext()

  const { id } = useParams()
  const preamble = feedbackTarget?.continuousFeedbackPreamble?.trim()

  const handleSubmit = async values => {
    try {
      if (!values.feedback.length) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }
      await saveContinuousFeedback(values, id)

      navigate(`/targets/${id}/continuous-feedback`)

      enqueueSnackbar(t('norppaFeedback:successAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box mb={2}>
      <Typography variant="h4" component="h4">
        {t('userFeedbacks:giveContinuousFeedback')}
      </Typography>
      <Box my={2} data-cy="continuousFeedbackPreambleDisplay">
        <Alert severity="info">
          <Typography variant="body2" component="p" sx={{ whiteSpace: 'pre-line' }}>
            {t('feedbackView:continuousFeedbackInfo')}
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
            <Box sx={{ mt: '1rem' }}>
              <NorButton
                type="submit"
                color="primary"
                disabled={!values.feedback.length || isSubmitting || (fewEnrolled && !values.activateSubmit)}
                sx={styles.button}
              >
                {t('norppaFeedback:submit')}
              </NorButton>
              {fewEnrolled && (
                <ConsentCheckbox
                  dataCy="continuous-feedback-consent-checkbox"
                  label={t('feedbackView:allowSubmitCheckbox', {
                    count: FEEDBACK_HIDDEN_STUDENT_COUNT,
                  })}
                  handleChange={setFieldValue}
                />
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ContinuousFeedback
