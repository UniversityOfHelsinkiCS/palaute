import React from 'react'

import { Card, CardContent, List } from '@mui/material'

import FeedbackTargetItem from './FeedbackTargetItem'

const CourseRealisationItem = ({ courseRealisation }) => {
  const { feedbackTargets } = courseRealisation

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <List disablePadding>
          {feedbackTargets.map((feedbackTarget, index) => (
            <FeedbackTargetItem
              feedbackTarget={feedbackTarget}
              divider={index < feedbackTargets.length - 1}
              key={feedbackTarget.id}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CourseRealisationItem
