import React from 'react'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Button,
  Box,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../QuestionEditor'
import useUniversitySurvey from '../../hooks/useUniversitySurvey'
import { getInitialValues, validate, saveValues } from './utils'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const EditUniversitySurvey = () => {
  const { t, i18n } = useTranslation()
  const { language } = i18n
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { survey, isLoading: surveyIsLoading } = useUniversitySurvey()
  const isLoading = surveyIsLoading

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  const handleSubmit = async (values) => {
    try {
      await saveValues(values, survey)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(survey)
  const name = getLanguageValue(survey?.courseUnit?.name, i18n.language)

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {name}
      </Typography>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        <Form>
          <QuestionEditor language={language} name="questions" highLevel />

          <Box mt={2}>
            <Button color="primary" variant="contained" type="submit">
              {t('save')}
            </Button>
          </Box>
        </Form>
      </Formik>
    </>
  )
}

export default EditUniversitySurvey
