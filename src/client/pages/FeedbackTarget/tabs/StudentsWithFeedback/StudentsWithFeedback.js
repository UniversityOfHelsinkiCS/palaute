import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'
import StudentTable from './StudentTable'
import useStudentsWithFeedback from '../../../../hooks/useStudentsWithFeedback'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

const StudentsWithFeedback = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { feedbackTarget } = useFeedbackTargetContext()

  const { students, isLoading } = useStudentsWithFeedback(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  const noFeedbackALert = (
    <Box mb={2}>
      <Alert severity="info">{t('studentsWithFeedback:noFeedbackInfo')}</Alert>
    </Box>
  )

  return (
    <>
      {students.length === 0 && noFeedbackALert}
      {students.length > 0 && <StudentTable students={students} feedbackTarget={feedbackTarget} />}
    </>
  )
}

export default StudentsWithFeedback
