import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Box, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import FormikCheckbox from '../../../../components/common/FormikCheckbox'
import { saveContinuousFeedback } from './utils'
import { NorButton } from '../../../../components/common/NorButton'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'

const styles = {
  description: {
    width: '80%',
    marginTop: 2,
    marginBottom: 3,
    color: '#606060',
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

  const { id } = useParams()

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
      <Typography variant="body1" component="p" sx={styles.description}>
        {t('feedbackView:continuousFeedbackInfo')}
      </Typography>
      <Formik initialValues={{ feedback: '' }} onSubmit={handleSubmit}>
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
                <FormikCheckbox
                  data-cy="feedback-view-consent-checkbox"
                  name="activateSubmit"
                  label={t('feedbackView:allowSubmitCheckbox', {
                    count: FEEDBACK_HIDDEN_STUDENT_COUNT,
                  })}
                  onChange={({ target }) => {
                    setFieldValue('activateSubmit', target.checked)
                  }}
                  sx={{ ml: '1rem' }}
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
