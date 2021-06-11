import React, { useMemo } from 'react'
import { Box, CircularProgress, List, Typography } from '@material-ui/core'

import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getRelevantFeedbackTargets } from './utils'
import FeedbackTargetItem from './FeedbackTargetItem'

const FeedbackTargetList = ({ courseCode }) => {
  const { feedbackTargets, isLoading } = useCourseUnitFeedbackTargets(
    courseCode,
  )

  const targets = useMemo(
    () => getRelevantFeedbackTargets(feedbackTargets ?? []),
    [feedbackTargets],
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress />
      </Box>
    )
  }

  if (targets.length === 0) {
    return (
      <Box p={2}>
        <Typography color="textSecondary" align="center">
          Ei toteutuksia
        </Typography>
      </Box>
    )
  }

  return (
    <List>
      {targets.map((target) => (
        <FeedbackTargetItem key={target.id} feedbackTarget={target} />
      ))}
    </List>
  )
}

export default FeedbackTargetList
