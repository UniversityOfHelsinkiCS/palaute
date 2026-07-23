import { Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import useStudentsWithFeedback from '../../../../hooks/useStudentsWithFeedback'
import feedbackTargetIsEnded from '../../../../util/feedbackTargetIsEnded'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import StudentTable from './StudentTable'

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
  const id = useFeedbackTargetId()

  const { feedbackTarget } = useFeedbackTargetContext()
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const { students, isLoading } = useStudentsWithFeedback(id)

  if (isLoading) return <LoadingProgress />

  const feedbackStatusAvailable = students.some(student => 'feedbackGiven' in student)
  const showStudentTable = students.length !== 0

  return (
    <Box id="feedback-target-tab-content">
      {!feedbackStatusAvailable && <NoFeedbackAlert isEnded={isEnded} />}
      {showStudentTable && <StudentTable students={students} feedbackTarget={feedbackTarget} />}
    </Box>
  )
}

export default StudentsWithFeedback
