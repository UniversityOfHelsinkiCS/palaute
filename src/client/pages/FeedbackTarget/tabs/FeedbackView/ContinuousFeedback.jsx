import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Box, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../../../components/common/FormikTextField'
import { saveContinuousFeedback } from './utils'
import { NorButton } from '../../../../components/common/NorButton'

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
        {({ values, isSubmitting }) => (
          <Form sx={styles.container}>
            <FormikTextField name="feedback" label={t('norppaFeedback:feedback')} fullWidth minRows={4} multiline />
            <NorButton
              type="submit"
              color="primary"
              disabled={!values.feedback.length || isSubmitting}
              sx={styles.button}
            >
              {t('norppaFeedback:submit')}
            </NorButton>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ContinuousFeedback
