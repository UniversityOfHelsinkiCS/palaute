import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

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

import FeedbackForm from './FeedbackForm'
import useFeedbackTarget from '../hooks/useFeedbackTarget'
import { getLanguageValue } from '../util/languageUtils'

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
  const { i18n } = useTranslation()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

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

  const questions = feedbackTarget.questions ?? []

  const name = getLanguageValue(feedbackTarget.name, i18n.language)

  const handleSubmit = (values) => {
    console.log(values)
    // TODO: api request stuff
    enqueueSnackbar('Feedback has been given', { variant: 'success' })
  }

  return (
    <>
      <Typography variant="h4" component="h2" className={classes.heading}>
        {name}
      </Typography>

      <Formik
        initialValues={{ questions }}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur
      >
        <Form>
          <FeedbackForm name="questions" />
          <Box mt={2}>
            <Button color="primary" variant="contained" type="submit">
              Give feedback
            </Button>
          </Box>
        </Form>
      </Formik>
    </>
  )
}

export default FeedbackView
