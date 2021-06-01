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
import LanguageTabs from '../LanguageTabs'
import Alert from '../Alert'

import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'
import userOrganisations from '../../hooks/useOrganisations'

import { getInitialValues, validate, saveValues } from './utils'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles((theme) => ({
  programmeName: {
    marginBottom: theme.spacing(2),
  },
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
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { surveyCode } = useParams()

  const [language, setLanguage] = useState('fi')

  const { survey, isLoading: surveyIsLoading } = useProgrammeSurvey(surveyCode)
  const { organisations } = userOrganisations()

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

  const programmeName = getLanguageValue(
    survey.organisation.name,
    i18n.language,
  )

  const writeAccess =
    organisations &&
    organisations.length > 0 &&
    !!organisations.find((org) => org.code === surveyCode).access.write

  return (
    <>
      <Typography variant="h4" component="h4" className={classes.programmeName}>
        {programmeName}
      </Typography>
      {!survey && <Typography>This programme has no survey yet</Typography>}
      {!writeAccess && (
        <Alert severity="info">{t('editProgrammeSurvey:noWriteAccess')}</Alert>
      )}
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
              writeAccess={writeAccess}
            />

            {writeAccess && (
              <Box mt={2}>
                <Button color="primary" variant="contained" type="submit">
                  {t('save')}
                </Button>
              </Box>
            )}
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditProgrammeSurvey
