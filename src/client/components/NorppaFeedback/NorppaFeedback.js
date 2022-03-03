import React from 'react'
import { useHistory } from 'react-router'

import { Box, Button, makeStyles, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

import FormikTextField from '../FormikTextField'
import FormikCheckBox from '../FormikCheckbox'
import { saveValues } from './utils'

const useStyles = makeStyles(() => ({
  descritpion: {
    width: '80%',
    marginTop: 10,
    marginBottom: 10,
    color: '#606060',
  },
  button: {
    width: 'fit-content',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}))

const NorppaFeedback = () => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const handleSubmit = async (values) => {
    try {
      if (!values.feedback.length) {
        enqueueSnackbar(t('norppaFeedback:feedbackLengthError'), {
          variant: 'error',
        })
      }
      await saveValues(values)

      history.push('/')

      enqueueSnackbar(t('norppaFeedback:successAlert'), {
        variant: 'success',
        autoHideDuration: 6000,
      })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }
  return (
    <Box>
      <Typography variant="h4" component="h4">
        {t('norppaFeedback:title')}
      </Typography>
      <Typography variant="body1" component="p" className={classes.descritpion}>
        {t('norppaFeedback:description')}
      </Typography>
      <Formik
        initialValues={{ feedback: '', responseWanted: false }}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form className={classes.container}>
            <FormikTextField
              name="feedback"
              label={t('norppaFeedback:feedback')}
              helperText={t('norppaFeedback:feedbackHelper')}
              fullWidth
              multiline
            />
            <FormikCheckBox
              name="responseWanted"
              label={t('norppaFeedback:responseWanted')}
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!values.feedback.length || isSubmitting}
              className={classes.button}
            >
              {t('norppaFeedback:submit')}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default NorppaFeedback
