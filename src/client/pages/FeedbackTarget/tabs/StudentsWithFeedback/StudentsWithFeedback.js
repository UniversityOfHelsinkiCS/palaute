import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'
import StudentTable from './StudentTable'
import useStudentsWithFeedback from '../../../../hooks/useStudentsWithFeedback'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'

const NoFeedbackAlert = ({ isOpen }) => {
  const { t } = useTranslation()

  return (
    <Box mb={2}>
      <Alert severity="info">
        {isOpen ? t('studentsWithFeedback:cannotShowWhenOpen') : t('studentsWithFeedback:noFeedbackInfo')}
      </Alert>
    </Box>
  )
}

const StudentsWithFeedback = () => {
  const { id } = useParams()

  const { feedbackTarget } = useFeedbackTargetContext()
  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  const { students, isLoading } = useStudentsWithFeedback(id)

  if (isLoading) return <LoadingProgress />

  const feedbackStatusAvailable = students.some(student => 'feedbackgiven' in student)

  return (
    <>
      {!feedbackStatusAvailable && <NoFeedbackAlert isOpen={isOpen} />}
      <StudentTable students={students} feedbackTarget={feedbackTarget} />
    </>
  )
}

export default StudentsWithFeedback
