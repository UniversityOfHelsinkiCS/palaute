import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Box, Paper, Typography, Alert } from '@mui/material'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import useFeedbackTargetContinuousFeedbacks from '../../hooks/useFeedbackTargetContinuousFeedbacks'
import { LoadingProgress } from '../common/LoadingProgress'

const FeedbackItem = ({ feedback }) => {
  const { createdAt, data } = feedback

  return (
    <Box>
      <Paper>
        <Box padding={2} marginBottom={2}>
          <Typography variant="body1">{data}</Typography>
          <Typography variant="body2">
            {format(new Date(createdAt), 'dd.MM.yy HH.mm')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

const FeedbackTargetContinuousFeedback = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { continuousFeedbacks, isLoading } =
    useFeedbackTargetContinuousFeedbacks(id)

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!continuousFeedbacks) {
    return <Redirect to="/" />
  }

  const sortedFeedbacks = continuousFeedbacks.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  return (
    <Box margin={3}>
      <Typography mb={1} textTransform="uppercase">
        {t('feedbackTargetView:continuousFeedbackGiven')}
      </Typography>
      {sortedFeedbacks.length ? (
        sortedFeedbacks.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))
      ) : (
        <Alert severity="info">
          {t('feedbackTargetView:noContinuousFeedbackGiven')}
        </Alert>
      )}
    </Box>
  )
}

export default FeedbackTargetContinuousFeedback
