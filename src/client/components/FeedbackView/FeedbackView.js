import React from 'react'
import { useParams, useHistory, Redirect } from 'react-router-dom'

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

import FeedbackForm from '../FeedbackForm'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

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

  const name = getLanguageValue(feedbackTarget.name, i18n.language)
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

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.heading}>
        {name}
      </Typography>

      {!isOpen && closedAlert}

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ isSubmitting }) => (
          <Form>
            <Card>
              <CardContent>
                <Box mb={2}>
                  <Alert severity="info">
                    {t('feedbackView:requiredInfo')}
                  </Alert>
                </Box>
                <FeedbackForm questions={questions} name="answers" />
              </CardContent>
            </Card>

            <Box mt={2}>
              <Button
                disabled={isSubmitting || !isOpen}
                color="primary"
                variant="contained"
                type="submit"
              >
                {t('feedbackView:submitButton')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default FeedbackView
