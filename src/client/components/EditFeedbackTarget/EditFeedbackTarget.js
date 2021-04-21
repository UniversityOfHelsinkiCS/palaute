import React, { useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Button,
  Box,
  Card,
  CardContent,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../QuestionEditor'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import FormikTextField from '../FormikTextField'
import FormikDatePicker from '../FormikDatePicker'
import FormikCheckbox from '../FormikCheckbox'
import useFeedbackTargetSurveys from '../../hooks/useFeedbackTargetSurveys'
import { getInitialValues, validate, saveValues } from './utils'
import LanguageTabs from '../LanguageTabs'

const useStyles = makeStyles((theme) => ({
  heading: {
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 500,
  },
}))

const EditFeedbackTarget = () => {
  const { feedbackTargetId } = useParams()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [language, setLanguage] = useState('fi')

  const {
    feedbackTarget,
    isLoading: feedbackTargetIsLoading,
  } = useFeedbackTarget(feedbackTargetId, {
    cacheTime: 0,
  })

  const {
    surveys,
    isLoading: surveysIsLoading,
  } = useFeedbackTargetSurveys(feedbackTargetId, { cacheTime: 0 })

  const isLoading = feedbackTargetIsLoading || surveysIsLoading

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const name = getLanguageValue(feedbackTarget.name, i18n.language)

  const handleSubmit = async (values) => {
    try {
      await saveValues(values, surveys, feedbackTargetId)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(feedbackTarget, surveys)

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {name}
      </Typography>

      <LanguageTabs
        language={language}
        onChange={(newLanguage) => setLanguage(newLanguage)}
        className={classes.languageTabs}
      />

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        <Form>
          <Box mb={2}>
            <Card>
              <CardContent>
                <div className={classes.form}>
                  <Box mb={2}>
                    <FormikTextField
                      name={`name.${language}`}
                      label={t('name')}
                      fullWidth
                    />
                  </Box>

                  <Box mb={2}>
                    <FormikCheckbox name="hidden" label="Hidden" />
                  </Box>

                  <Box mb={2}>
                    <FormikDatePicker
                      name="opensAt"
                      label={t('editFeedbackTarget:opensAt')}
                      fullWidth
                    />
                  </Box>

                  <FormikDatePicker
                    name="closesAt"
                    label={t('editFeedbackTarget:closesAt')}
                    fullWidth
                  />
                </div>
              </CardContent>
            </Card>
          </Box>

          <QuestionEditor language={language} name="questions" />

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

export default EditFeedbackTarget
