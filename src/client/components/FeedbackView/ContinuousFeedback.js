import React from 'react'
import { useHistory, useParams } from 'react-router'
import { Box, Button, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../common/FormikTextField'
import { saveContinuousFeedback } from './utils'

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

const ContinuousFeedback = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const { id } = useParams()

  const handleSubmit = async values => {
    try {
      if (!values.feedback.length) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }
      await saveContinuousFeedback(values, id)

      history.push(`/targets/${id}/continuous-feedback`)

      enqueueSnackbar(t('norppaFeedback:successAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
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
        {({ values, isSubmitting }) => (
          <Form sx={styles.container}>
            <FormikTextField
              name="feedback"
              label={t('norppaFeedback:feedback')}
              helperText={t('norppaFeedback:feedbackHelper')}
              fullWidth
              minRows={4}
              multiline
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!values.feedback.length || isSubmitting}
              sx={styles.button}
            >
              {t('norppaFeedback:submit')}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ContinuousFeedback
