import React from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import { sendContinuousFeedbackResponse } from './utils'
import { NorButton } from '../../../../components/common/NorButton'

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

  const handleSubmit = async values => {
    try {
      if (!values.response.length && !response) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }

      await sendContinuousFeedbackResponse(values, id, feedbackId)

      setShow(false)
      refetch()

      enqueueSnackbar(t('feedbackTargetView:continuousFeedbackResponseSuccessAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const sendEnabled = (current, isSubmitting) => (response || current.length) && !isSubmitting

  return (
    <Box mb={3}>
      <Formik initialValues={{ response }} onSubmit={handleSubmit}>
        {({ values, isSubmitting }) => (
          <Form sx={styles.container}>
            <FormikTextField
              name="response"
              label={t('feedbackTargetView:continuousFeedbackResponse')}
              fullWidth
              minRows={4}
              multiline
              sx={{ mb: '0.5rem' }}
            />
            <NorButton
              type="submit"
              color="primary"
              disabled={!sendEnabled(values.response, isSubmitting)}
              sx={styles.button}
              data-cy="sendContinuousFeedbackResponse"
            >
              {response ? t('common:edit') : t('common:send')}
            </NorButton>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ResponseForm
