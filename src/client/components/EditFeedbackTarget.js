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
import { parseISO, isAfter } from 'date-fns'

import QuestionEditor from './QuestionEditor'
import useFeedbackTarget from '../hooks/useFeedbackTarget'
import { getLanguageValue } from '../util/languageUtils'
import FormikTextField from './FormikTextField'
import FormikDatePicker from './FormikDatePicker'
import FormikCheckbox from './FormikCheckbox'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(2),
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
  row: {
    marginBottom: 10,
  },
}))

const EditFeedbackTarget = () => {
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

  const name = getLanguageValue(feedbackTarget.name, i18n.language)

  const handleSubmit = (values) => {
    console.log(values)
    if (isAfter(parseISO(values.closesAt), parseISO(values.opensAt))) {
      enqueueSnackbar('Questions have been saved', { variant: 'success' })
    } else {
      enqueueSnackbar('Feedback needs to open before it closes', {
        variant: 'warning',
      })
    }
  }

  return (
    <>
      <Typography variant="h4" component="h2" className={classes.heading}>
        {name}
      </Typography>

      <Formik
        initialValues={{
          name: '',
          hidden: feedbackTarget.hidden,
          questions: [],
          opensAt: '',
          closesAt: '',
        }}
        onSubmit={handleSubmit}
        validateOnChange={false}
      >
        <Form>
          <div className={classes.form}>
            <Typography variant="h6" component="h4" className={classes.row}>
              Edit feedback target
            </Typography>
            <FormikTextField name="name" placeholder="Feedback name" />
            <FormikCheckbox name="hidden" label="Hidden" />
            <FormikDatePicker
              name="opensAt"
              label="Opens at"
              className={classes.row}
            />
            <FormikDatePicker
              name="closesAt"
              label="Closes at"
              className={classes.row}
            />
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
