import React, { useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Divider,
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
import Alert from '../Alert'
import DirtyFormPrompt from '../DirtyFormPrompt'
import Toolbar from './Toolbar'

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
  toolbarDivider: {
    margin: theme.spacing(2, 0),
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
        {courseUnitName}
      </Typography>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ handleSubmit }) => (
          <Form>
            <DirtyFormPrompt />
            <Box mb={2}>
              <Card>
                <CardContent>
                  <div className={classes.form}>
                    <Box hidden mb={2}>
                      <FormikTextField
                        name={`name.${language}`}
                        label={t('name')}
                        fullWidth
                      />
                    </Box>

                    <Box mb={2}>
                      <FormikCheckbox
                        name="hidden"
                        label={t('editFeedbackTarget:hidden')}
                      />
                    </Box>

                    <Box mb={2}>
                      <FormikDatePicker
                        name="opensAt"
                        label={t('editFeedbackTarget:opensAt')}
                        fullWidth
                      />
                    </Box>

                    <Box mb={2}>
                      <FormikDatePicker
                        name="closesAt"
                        label={t('editFeedbackTarget:closesAt')}
                        fullWidth
                      />
                    </Box>
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

            <Divider className={classes.toolbarDivider} />

            <Toolbar
              onSave={handleSubmit}
              previewLink={`/targets/${id}/feedback`}
              language={language}
              onLanguageChange={(newLanguage) => setLanguage(newLanguage)}
            />
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditFeedbackTarget
