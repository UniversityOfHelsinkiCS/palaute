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

import QuestionEditor from '../QuestionEditor'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import FormikTextField from '../FormikTextField'
import FormikDatePicker from '../FormikDatePicker'
import FormikCheckbox from '../FormikCheckbox'
import useFeedbackTargetSurveys from '../../hooks/useFeedbackTargetSurveys'
import { getInitialValues, validate, saveValues } from './utils'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(4),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
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
      await saveValues(values, surveys)
      enqueueSnackbar('Questions have been saved', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(feedbackTarget, surveys)

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
        <Form>
          <div className={classes.form}>
            <Box mb={2}>
              <FormikTextField
                name="name"
                label="Name"
                placeholder="Feedback name"
                fullWidth
              />
            </Box>
            <Box mb={2}>
              <FormikCheckbox name="hidden" label="Hidden" />
            </Box>
            <Box mb={2}>
              <FormikDatePicker name="opensAt" label="Opens at" fullWidth />
            </Box>
            <Box mb={2}>
              <FormikDatePicker name="closesAt" label="Closes at" fullWidth />
            </Box>
          </div>
          <QuestionEditor name="questions" />
          <Box mt={2}>
            <Button color="primary" variant="contained" type="submit">
              Save questions
            </Button>
          </Box>
        </Form>
      </Formik>
    </>
  )
}

export default EditFeedbackTarget
