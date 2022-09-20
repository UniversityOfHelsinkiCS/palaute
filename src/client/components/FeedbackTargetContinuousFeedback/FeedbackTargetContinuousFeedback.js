import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import { format } from 'date-fns'

import useFeedbackTargetContinuousFeedbacks from '../../hooks/useFeedbackTargetContinuousFeedbacks'
import { LoadingProgress } from '../LoadingProgress'

const FeedbackTargetContinuousFeedback = () => {
  const { id } = useParams()

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
      {sortedFeedbacks.map(({ id, createdAt, data }) => (
        <Box key={id} margin={2}>
          <Paper>
            <Box padding={2} marginBottom={2}>
              <Typography variant="body1">{data}</Typography>
              <Typography variant="body2">
                {format(new Date(createdAt), 'dd.MM.yyyy')}
              </Typography>
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  )
}

export default FeedbackTargetContinuousFeedback
