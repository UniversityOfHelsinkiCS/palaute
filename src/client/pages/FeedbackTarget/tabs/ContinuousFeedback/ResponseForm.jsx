import { Box } from '@mui/material'
import { Form, Formik } from 'formik'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import FormikTextField from '../../../../components/common/FormikTextField'
import { NorButton } from '../../../../components/common/NorButton'
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

const ResponseForm = ({ feedbackId, setShow, refetch, response = '', feedbackText, onSaved }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const { id } = useParams()

  // The feedback text the teacher saw when they started writing, to notice if the student edited it in the meantime
  const [feedbackTextWhenOpened] = useState(feedbackText)

  const handleSubmit = async values => {
    try {
      if (!values.response.length && !response) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }

      const savedFeedback = await sendContinuousFeedbackResponse(values, id, feedbackId)

      setShow(false)
      refetch()
      onSaved?.({
        feedbackChanged: feedbackTextWhenOpened !== undefined && savedFeedback.data !== feedbackTextWhenOpened,
      })

      enqueueSnackbar(t('feedbackTargetView:continuousFeedbackResponseSuccessAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch {
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
              data-cy="continuousFeedbackResponseInput"
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
