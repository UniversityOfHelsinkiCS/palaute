import React, { useState } from 'react'
import { useParams, Redirect, Link } from 'react-router-dom'

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
import LanguageTabs from '../LanguageTabs'
import Alert from '../Alert'
import DirtyFormPrompt from '../DirtyFormPrompt'

import {
  getInitialValues,
  validate,
  saveValues,
  getUpperLevelQuestions,
} from './utils'

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
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [language, setLanguage] = useState('fi')

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    cacheTime: 0,
  })

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

  const feedbackTargetName = getLanguageValue(
    feedbackTarget.name,
    i18n.language,
  )

  const courseUnitName = getLanguageValue(
    feedbackTarget.courseUnit.name,
    i18n.language,
  )

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(
    (q) => q.type !== 'TEXT',
  )

  const handleSubmit = async (values, actions) => {
    try {
      await saveValues(values, feedbackTarget)

      // Necessary for the <DirtyFormPrompt />
      actions.resetForm({ values })

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(feedbackTarget)

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {feedbackTargetName}
      </Typography>

      <Box mb={2}>
        <Typography>{courseUnitName}</Typography>
      </Box>

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
          <DirtyFormPrompt />
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

          {upperLevelQuestions.length > 0 && (
            <Box mb={2}>
              <Alert severity="info">
                {t('editFeedbackTarget:upperLevelQuestionsInfo', {
                  count: upperLevelQuestions.length,
                })}
              </Alert>
            </Box>
          )}

          <QuestionEditor language={language} name="questions" />

          <Box mt={2}>
            <Box mr={1} clone>
              <Button color="primary" variant="contained" type="submit">
                {t('save')}
              </Button>
            </Box>
            <Button
              color="primary"
              type="submit"
              component={Link}
              to={`/targets/${id}/feedback`}
            >
              {t('show')}
            </Button>
          </Box>
        </Form>
      </Formik>
    </>
  )
}

export default EditFeedbackTarget
