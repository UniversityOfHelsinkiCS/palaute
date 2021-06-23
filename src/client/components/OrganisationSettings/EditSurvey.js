import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CircularProgress, Box, Button } from '@material-ui/core'

import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../QuestionEditor'
import LanguageTabs from '../LanguageTabs'
import Alert from '../Alert'

import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'

import {
  getSurveyInitialValues,
  saveSurveyValues,
  getUpperLevelQuestions,
} from './utils'

const EditSurvey = ({ organisation }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { code } = organisation

  const [language, setLanguage] = useState('fi')

  const { survey, isLoading } = useProgrammeSurvey(code)

  const surveyId = survey?.id

  const upperLevelQuestions = getUpperLevelQuestions(survey)

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const handleSubmit = async (values, actions) => {
    try {
      await saveSurveyValues(values, surveyId)
      actions.resetForm({ values })

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getSurveyInitialValues(survey)

  return (
    <>
      <Box mb={2}>
        <Alert severity="info">
          {t('organisationSettings:surveyInfo', {
            count: upperLevelQuestions.length,
          })}
        </Alert>
      </Box>

      <Box mb={2}>
        <LanguageTabs
          language={language}
          onChange={(newLanguage) => setLanguage(newLanguage)}
        />
      </Box>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
      >
        {({ handleSubmit, dirty }) => (
          <Form>
            <QuestionEditor
              language={language}
              name="questions"
              onStopEditing={handleSubmit}
            />

            <Box mt={2}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={!dirty}
              >
                {t('save')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditSurvey
