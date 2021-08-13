import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

import {
  CircularProgress,
  makeStyles,
  Divider,
  Box,
  Card,
  CardContent,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'
import { parseISO } from 'date-fns'

import QuestionEditor from '../QuestionEditor'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import FormikTextField from '../FormikTextField'
import FormikDatePicker from '../FormikDatePicker'
import FormikCheckbox from '../FormikCheckbox'
import Alert from '../Alert'
import DirtyFormPrompt from '../DirtyFormPrompt'
import Toolbar from './Toolbar'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { isAdmin } from '../NavBar/utils'

import {
  getInitialValues,
  validate,
  saveValues,
  getUpperLevelQuestions,
  requiresSaveConfirmation,
  openCourseImmediately,
  parseDate,
} from './utils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(1),
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
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { authorizedUser } = useAuthorizedUser()
  const isAdminUser = isAdmin(authorizedUser)

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
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

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(
    (q) => q.type !== 'TEXT',
  )

  const handleSubmit = async (values, actions) => {
    try {
      if (
        requiresSaveConfirmation(values) &&
        // eslint-disable-next-line no-alert
        !window.confirm(t('editFeedbackTarget:opensAtIsNow'))
      ) {
        return
      }

      await saveValues(values, feedbackTarget)
      // Necessary for the <DirtyFormPrompt />
      actions.resetForm({ values })

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleOpenClick = async () => {
    // eslint-disable-next-line no-alert
    const result = window.confirm(
      t('editFeedbackTarget:openImmediatelyConfirm'),
    )
    if (result) {
      try {
        await openCourseImmediately(feedbackTarget)
        window.location.reload()
      } catch (e) {
        enqueueSnackbar(t('unknownError'), { variant: 'error' })
      }
    }
  }

  const initialValues = getInitialValues(feedbackTarget)

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ handleSubmit, dirty }) => (
          <Form>
            <DirtyFormPrompt />
            <Box mb={2}>
              <Card>
                <CardContent>
                  {isAdminUser ? (
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
                      <Alert severity="warning">
                        {t('editFeedbackTarget:warningAboutOpeningCourse')}
                      </Alert>
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
                  ) : (
                    <div className={classes.form}>
                      <Box mb={2}>
                        {`${t('editFeedbackTarget:opensAt')} ${parseDate(
                          feedbackTarget.opensAt,
                        )} - 
                        ${t('editFeedbackTarget:closesAt')} ${parseDate(
                          feedbackTarget.closesAt,
                        )}`}
                      </Box>
                    </div>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={parseISO(feedbackTarget.opensAt) < new Date()}
                    onClick={handleOpenClick}
                  >
                    {t('editFeedbackTarget:openImmediately')}
                  </Button>
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

            <QuestionEditor
              language={language}
              name="questions"
              onStopEditing={handleSubmit}
            />

            <Divider className={classes.toolbarDivider} />

            <Toolbar
              onSave={handleSubmit}
              previewLink={`/targets/${id}/feedback`}
              language={language}
              onLanguageChange={(newLanguage) =>
                i18n.changeLanguage(newLanguage)
              }
              formIsDirty={dirty}
            />
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditFeedbackTarget
