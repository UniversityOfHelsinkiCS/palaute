import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  makeStyles,
  Typography,
  CircularProgress,
  Box,
  Button,
} from '@material-ui/core'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../QuestionEditor'
import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'
import LanguageTabs from '../LanguageTabs'

import { getInitialValues, validate, saveValues } from './utils'

const useStyles = makeStyles((theme) => ({
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  languageTabs: {
    marginBottom: theme.spacing(2),
  },
}))

const EditProgrammeSurvey = () => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { surveyCode } = useParams()

  const [language, setLanguage] = useState('fi')

  const { survey, isLoading: surveyIsLoading } = useProgrammeSurvey(surveyCode)

  const surveyId = survey && survey.id

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
      await saveValues(values, surveyId)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(survey)

  return (
    <>
      {!survey && <Typography>This programme has no survey yet</Typography>}
      <LanguageTabs
        language={language}
        onChange={(newLanguage) => setLanguage(newLanguage)}
        className={classes.LanguageTabs}
      />

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ values }) => (
          <Form>
            <QuestionEditor
              language={language}
              name="questions"
              values={values}
              highLevel
            />

            <Box mt={2}>
              <Button color="primary" variant="contained" type="submit">
                {t('save')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditProgrammeSurvey
