import React, { useState } from 'react'
import { useParams, useHistory, Redirect } from 'react-router-dom'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Button,
  Box,
  Card,
  CardContent,
  Link,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import FeedbackForm from '../FeedbackForm'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import PrivacyDialog from './PrivacyDialog'

import {
  makeValidate,
  getInitialValues,
  saveValues,
  getQuestions,
  formatDate,
} from './utils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
  },
  feedbackInfoLink: {
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'underline',
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const FeedbackView = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)

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

  const { courseUnit, accessStatus } = feedbackTarget
  const isTeacher = accessStatus === 'TEACHER'
  const courseUnitName = getLanguageValue(courseUnit.name, i18n.language)

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const questions = getQuestions(feedbackTarget)
  const initialValues = getInitialValues(feedbackTarget)
  const validate = makeValidate(questions)
  const { opensAt, closesAt } = feedbackTarget

  const handleSubmit = async (values) => {
    try {
      await saveValues(values, feedbackTarget)
      history.push('/')
      enqueueSnackbar(t('feedbackView:successAlert'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const closedAlert = (
    <Box mb={2}>
      <Alert severity="warning">
        {t('feedbackView:closedInfo', {
          opensAt: formatDate(new Date(opensAt)),
          closesAt: formatDate(new Date(closesAt)),
        })}
      </Alert>
    </Box>
  )

  const handleClosePrivacyDialog = () => {
    setPrivacyDialogOpen(false)
  }

  const handleOpenPrivacyDialog = (event) => {
    event.preventDefault()
    setPrivacyDialogOpen(true)
  }

  return (
    <>
      <PrivacyDialog
        open={privacyDialogOpen}
        onClose={handleClosePrivacyDialog}
      />

      <Typography variant="h4" component="h1" className={classes.heading}>
        {courseUnitName}
      </Typography>

      {!isOpen && closedAlert}

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ isSubmitting }) => {
          const disabled = isSubmitting || !isOpen || isTeacher

          return (
            <Form>
              <Card>
                <CardContent>
                  <Box mb={2}>
                    <Alert severity="info">
                      {t('feedbackView:feedbackInfo')}{' '}
                      <Link
                        color="inherit"
                        href="#feedback-privacy-dialog-title"
                        className={classes.feedbackInfoLink}
                        onClick={handleOpenPrivacyDialog}
                      >
                        {t('feedbackView:feedbackInfoLink')}
                      </Link>
                    </Alert>
                  </Box>
                  <FeedbackForm questions={questions} name="answers" />
                </CardContent>
              </Card>

              <Box mt={2}>
                <Button
                  disabled={disabled}
                  color="primary"
                  variant="contained"
                  type="submit"
                >
                  {t('feedbackView:submitButton')}
                </Button>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

export default FeedbackView
