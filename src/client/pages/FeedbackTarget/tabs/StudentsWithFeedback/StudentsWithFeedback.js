import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'
import StudentTable from './StudentTable'
import useStudentsWithFeedback from '../../../../hooks/useStudentsWithFeedback'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'

const NoFeedbackAlert = ({ isEnded }) => {
  const { t } = useTranslation()

  return (
    <Box mb={2}>
      <Alert severity="info">
        {isEnded ? t('studentsWithFeedback:noFeedbackInfo') : t('studentsWithFeedback:cannotShowBeforeFeedbackEnds')}
      </Alert>
    </Box>
  )
}

const StudentsWithFeedback = () => {
  const { id } = useParams()

  const { feedbackTarget } = useFeedbackTargetContext()
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  const { students, isLoading } = useStudentsWithFeedback(id)

  if (isLoading) return <LoadingProgress />

  const feedbackStatusAvailable = students.some(student => 'feedbackGiven' in student)
  const showStudentTable = students.length !== 0

  return (
    <>
      {!feedbackStatusAvailable && <NoFeedbackAlert isEnded={isEnded} />}
      {showStudentTable && <StudentTable students={students} feedbackTarget={feedbackTarget} />}
    </>
  )
}

export default StudentsWithFeedback
