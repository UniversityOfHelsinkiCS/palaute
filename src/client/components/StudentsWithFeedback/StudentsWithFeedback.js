import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Typography,
  Box,
  CircularProgress,
  makeStyles,
} from '@material-ui/core'

import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import { getLanguageValue } from '../../util/languageUtils'
import Alert from '../Alert'
import StudentTable from './StudentTable'
import useStudentsWithFeedback from '../../hooks/useStudentsWithFeedback'
import { getCoursePeriod } from './utils'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}))

const StudentsWithFeedback = () => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()
  const { id } = useParams()

  const {
    feedbackTarget,
    isLoading: feedbackTargetIsLoading,
  } = useFeedbackTarget(id)

  const { students, isLoading: studentsIsLoading } = useStudentsWithFeedback(id)

  const isLoading = feedbackTargetIsLoading || studentsIsLoading

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget || !students) {
    return <Redirect to="/" />
  }

  const noFeedbackALert = (
    <Box mb={2}>
      <Alert severity="info">{t('studentsWithFeedback:noFeedbackInfo')}</Alert>
    </Box>
  )

  const courseUnitName = getLanguageValue(
    feedbackTarget.courseUnit.name,
    i18n.language,
  )

  const coursePeriod =
    feedbackTarget && getCoursePeriod(feedbackTarget.courseRealisation)

  return (
    <>
      <Typography variant="h4" component="h1" className={classes.title}>
        {t('studentsWithFeedback:studentsList')}
      </Typography>

      <Box mb={2}>
        <Typography>{courseUnitName}</Typography>
        <Typography variant="body2">{coursePeriod}</Typography>
      </Box>

      {students.length === 0 && noFeedbackALert}

      {students.length > 0 && <StudentTable students={students} />}
    </>
  )
}

export default StudentsWithFeedback
