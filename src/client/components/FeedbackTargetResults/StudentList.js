import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Typography, Box, Card, CardContent } from '@material-ui/core'

import Alert from '../Alert'
import useStudentsWithFeedback from '../../hooks/useStudentsWithFeedback'

const getStudentDisplayName = (student) => {
  const { firstName, lastName, username } = student

  return firstName && lastName ? `${firstName} ${lastName}` : username
}

const FeedbackTargetResults = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { students, isLoading } = useStudentsWithFeedback(id)

  const hasStudents = !isLoading && Boolean(students?.length > 0)

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <Typography variant="h6" component="h2">
            {t('feedbackTargetResults:studentsWithFeedbackHeading')}
          </Typography>
        </Box>

        <Box mb={2}>
          <Alert severity="info">
            {t('feedbackTargetResults:notVisibleToStudentsInfo')}
          </Alert>
        </Box>

        {hasStudents && students.map(getStudentDisplayName).join(', ')}
        {!hasStudents && (
          <Typography>
            {t('feedbackTargetResults:noStudentsWithFeedback')}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default FeedbackTargetResults
