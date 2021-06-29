import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, CircularProgress } from '@material-ui/core'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import Alert from '../Alert'
import StudentTable from './StudentTable'
import useStudentsWithFeedback from '../../hooks/useStudentsWithFeedback'

const StudentsWithFeedback = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { feedbackTarget, isLoading: feedbackTargetIsLoading } =
    useFeedbackTarget(id)

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

  return (
    <>
      {students.length === 0 && noFeedbackALert}
      {students.length > 0 && <StudentTable students={students} />}
    </>
  )
}

export default StudentsWithFeedback
