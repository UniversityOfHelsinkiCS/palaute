import { Card, CardContent, List } from '@mui/material'

import type { CourseRealisationWithFeedbackTargets } from './utils'

import FeedbackTargetItem from './FeedbackTargetItem'

type CourseRealisationItemProps = {
  courseRealisation: CourseRealisationWithFeedbackTargets
}

const CourseRealisationItem = ({ courseRealisation }: CourseRealisationItemProps) => {
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
