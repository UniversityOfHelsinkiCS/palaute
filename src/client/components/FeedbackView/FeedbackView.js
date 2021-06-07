import React, { useState } from 'react'

import { useParams, useHistory, Redirect, Link } from 'react-router-dom'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Button,
  Box,
  Card,
  CardContent,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import FeedbackForm from '../FeedbackForm'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import PrivacyDialog from './PrivacyDialog'
import Toolbar from './Toolbar'
import AlertLink from '../AlertLink'

import {
  makeValidate,
  getInitialValues,
  saveValues,
  getQuestions,
  formatDate,
  checkIsFeedbackOpen,
} from './utils'

import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'

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

const FeedbackView = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { language } = i18n
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
  const isOutsider = accessStatus === 'NONE'
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const courseUnitName = getLanguageValue(courseUnit.name, i18n.language)

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const questions = getQuestions(feedbackTarget)
  const initialValues = getInitialValues(feedbackTarget)
  const validate = makeValidate(questions)
  const { opensAt, closesAt } = feedbackTarget

  const handleSubmit = async (values) => {
    try {
      if (checkIsFeedbackOpen(closesAt)) {
        enqueueSnackbar(t('feedbackView:feedbackClosedError'), {
          variant: 'error',
        })
      } else {
        await saveValues(values, feedbackTarget)
        history.push('/')
        enqueueSnackbar(t('feedbackView:successAlert'), { variant: 'success' })
      }
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

  const endedAlert = (
    <Box mb={2}>
      <Alert severity="info">
        <Trans i18nKey="feedbackView:endedInfo">
          The feedback period has ended.{' '}
          <AlertLink
            component={Link}
            to={`/targets/${feedbackTarget.id}/results`}
          >
            Take a look at the feedbacks
          </AlertLink>
        </Trans>
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

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language)
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

      {!isOpen && !isEnded && closedAlert}

      {isEnded && endedAlert}

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ isSubmitting }) => {
          const disabled = isSubmitting || !isOpen || isTeacher || isOutsider

          return (
            <Form>
              <Card>
                <CardContent>
                  <Box mb={2}>
                    <Alert severity="info">
                      {t('feedbackView:feedbackInfo')}{' '}
                      <AlertLink
                        href="#feedback-privacy-dialog-title"
                        onClick={handleOpenPrivacyDialog}
                      >
                        {t('feedbackView:feedbackInfoLink')}
                      </AlertLink>
                    </Alert>
                  </Box>

                  <FeedbackForm questions={questions} name="answers" />
                </CardContent>
              </Card>

              {!isTeacher && (
                <Box mt={2}>
                  <Button
                    disabled={disabled}
                    color="primary"
                    variant="contained"
                    type="submit"
                  >
                    {t('feedbackView:submitButton')}
                  </Button>
                  {isOutsider && ` ${t('feedbackView:cannotSubmitText')}`}
                </Box>
              )}
            </Form>
          )
        }}
      </Formik>
      {isTeacher && !isOpen && !isEnded && (
        <Box mt={2}>
          <Toolbar
            editLink={`/targets/${feedbackTarget.id}/edit`}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </Box>
      )}
    </>
  )
}

export default FeedbackView
