import React from 'react'
import { useParams, useHistory, Redirect } from 'react-router-dom'

import {
  Typography,
  CircularProgress,
  makeStyles,
  Button,
  Box,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import FeedbackForm from '../FeedbackForm'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'

import {
  makeValidate,
  getInitialValues,
  saveValues,
  getQuestions,
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
  const { feedbackTargetId } = useParams()
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const { feedbackTarget, isLoading } = useFeedbackTarget(feedbackTargetId, {
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

  const handleSubmit = async (values) => {
    try {
      await saveValues(values, feedbackTarget)
      history.push('/')
      enqueueSnackbar(t('feedbackView:successAlert'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const questions = getQuestions(feedbackTarget)
  const initialValues = getInitialValues(feedbackTarget)
  const validate = makeValidate(questions)

  return (
    <>
      <Typography variant="h4" component="h2" className={classes.heading}>
        {name}
      </Typography>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
        validateOnChange={false}
      >
        {({ isSubmitting }) => (
          <Form>
            <FeedbackForm questions={questions} name="answers" />
            <Box mt={2}>
              <Button
                disabled={isSubmitting}
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
