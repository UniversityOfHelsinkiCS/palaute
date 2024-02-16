import React from 'react'
import { Box, List, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FeedbackTargetListItem from './FeedbackTargetListItem'

const FeedbackTargetList = ({ courseRealisation, feedbackTargets }) => {
  const { t } = useTranslation()

  return (
    <List sx={{ margin: 0, padding: 0 }}>
      {feedbackTargets?.length === 0 ? (
        <Box p={2}>
          <Typography color="textSecondary" align="center">
            {t('teacherView:noCourseRealisations')}
          </Typography>
        </Box>
      ) : (
        feedbackTargets.map((feedbackTarget, i) => (
          <FeedbackTargetListItem
            key={feedbackTarget.id}
            courseRealisation={courseRealisation}
            feedbackTarget={feedbackTarget}
            divider={i < feedbackTargets.length - 1}
          />
        ))
      )}
    </List>
  )
}

export default FeedbackTargetList
