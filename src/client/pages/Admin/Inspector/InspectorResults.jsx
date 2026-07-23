import { Typography } from '@mui/material'
import React from 'react'

import FeedbackTargetItem from './FeedbackTargetItem'

const InspectorResults = ({ feedbackTargets, count }) => (
  <>
    <Typography sx={{ m: 2 }}>
      Showing {feedbackTargets.length}/{count} results
    </Typography>

    {feedbackTargets.map(feedbackTarget => (
      <FeedbackTargetItem key={feedbackTarget.id} feedbackTarget={feedbackTarget} />
    ))}
  </>
)

export default InspectorResults
