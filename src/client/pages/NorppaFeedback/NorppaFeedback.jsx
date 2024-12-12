import React from 'react'
import { useNavigate } from 'react-router'

import { Box, Typography } from '@mui/material'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../../components/common/FormikTextField'
import FormikCheckBox from '../../components/common/FormikCheckbox'
import { saveValues } from './utils'
import Title from '../../components/common/Title'
import { NorButton } from '../../components/common/NorButton'

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

const NorppaFeedback = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const handleSubmit = async values => {
    try {
      if (!values.feedback.length) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }
      await saveValues(values)

      navigate('/')

      enqueueSnackbar(t('norppaFeedback:successAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const confirmSubmit = event => {
    if (!window.confirm(t('norppaFeedback:confirm'))) event.preventDefault()
  }
  return (
    <Box>
      <Title>{t('common:norppaFeedback')}</Title>
      <Typography variant="h4" component="h4">
        {t('norppaFeedback:title')}
      </Typography>
      <Typography variant="body1" component="p" sx={styles.description}>
        {t('norppaFeedback:description')}
      </Typography>
      <Formik
        initialValues={{
          feedback: '',
          anonymous: false,
          responseWanted: false,
        }}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form sx={styles.container}>
            <FormikTextField
              name="feedback"
              label={t('norppaFeedback:feedback')}
              fullWidth
              minRows={4}
              multiline
              sx={{ marginBottom: '1rem' }}
            />
            <NorButton
              onClick={confirmSubmit}
              type="submit"
              color="primary"
              disabled={!values.feedback.length || isSubmitting}
              sx={{ ...styles.button, marginRight: '1rem' }}
            >
              {t('norppaFeedback:submit')}
            </NorButton>
            <FormikCheckBox
              name="anonymous"
              label={t('norppaFeedback:anonymous')}
              onChange={({ target }) => {
                // if anon is true, set responseWanted to false
                setFieldValue('responseWanted', values.responseWanted && !target.checked)
                setFieldValue('anonymous', target.checked)
              }}
            />
            <FormikCheckBox
              name="responseWanted"
              disabled={values.anonymous}
              label={t('norppaFeedback:responseWanted')}
            />
            {values.anonymous && (
              <Box mt="1.5rem">
                <Typography variant="body1" component="p" sx={styles.description}>
                  {t('norppaFeedback:anonymousInfo')}
                </Typography>
              </Box>
            )}
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default NorppaFeedback
