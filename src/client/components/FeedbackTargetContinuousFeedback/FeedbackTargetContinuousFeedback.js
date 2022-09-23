import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { Box, Paper, Typography, Alert } from '@mui/material'
import { format } from 'date-fns'

import useFeedbackTargetContinuousFeedbacks from '../../hooks/useFeedbackTargetContinuousFeedbacks'
import { LoadingProgress } from '../LoadingProgress'

const FeedbackItem = ({ feedback }) => {
  const { id, createdAt, data } = feedback

  return (
    <Box key={id}>
      <Paper>
        <Box padding={2} marginBottom={2}>
          <Typography variant="body1">{data}</Typography>
          <Typography variant="body2">
            {format(new Date(createdAt), 'dd.MM.yyyy')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

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
      <Typography mb={1} textTransform="uppercase">
        Annettu jatkuva palaute
      </Typography>
      {sortedFeedbacks.length ? (
        sortedFeedbacks.map((feedback) => <FeedbackItem feedback={feedback} />)
      ) : (
        <Alert severity="info">Jatkuvaa palautetta ei ole vielä annettu</Alert>
      )}
    </Box>
  )
}

export default FeedbackTargetContinuousFeedback
