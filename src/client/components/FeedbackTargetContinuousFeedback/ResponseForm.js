import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../common/FormikTextField'
import { sendContinuousFeedbackResponse } from './utils'

const styles = {
  button: {
    width: 'fit-content',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}

const ResponseForm = ({ feedbackId, setShow, refetch, response = '' }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { id } = useParams()

  const handleSubmit = async (values) => {
    try {
      if (!values.response.length) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }

      await sendContinuousFeedbackResponse(values, id, feedbackId)

      setShow(false)
      refetch()

      enqueueSnackbar(
        t('feedbackTargetView:continuousFeedbackResponseSuccessAlert'),
        {
          variant: 'success',
          autoHideDuration: 6000,
        },
      )
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <Box mb={3}>
      <Formik initialValues={{ response }} onSubmit={handleSubmit}>
        {({ values, isSubmitting }) => (
          <Form sx={styles.container}>
            <FormikTextField
              name="response"
              label={t('feedbackTargetView:continuousFeedbackResponse')}
              helperText={t(
                'feedbackTargetView:continuousFeedbackResponseInfo',
              )}
              fullWidth
              minRows={4}
              multiline
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!values.response.length || isSubmitting}
              sx={styles.button}
            >
              {t('feedbackTargetView:sendContinuousFeedbackResponse')}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ResponseForm
