import React from 'react'
import { Box, Typography, List } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FeedbackTargetListItem from './FeedbackTargetListItem'

const FeedbackTargetList = ({ courseRealisation }) => {
  const { t } = useTranslation()

  const { feedbackTargets, interimFeedbackTargets } = courseRealisation

  return (
    <List sx={{ margin: 0, padding: 0 }}>
      {feedbackTargets?.length === 0 ? (
        <Box p={2}>
          <Typography color="textSecondary" align="center">
            {t('teacherView:noCourseRealisations')}
          </Typography>
        </Box>
      ) : (
        feedbackTargets.map((target, i) => {
          const feedbackTarget = {
            ...target,
            courseRealisation,
          }
          return (
            <FeedbackTargetListItem
              key={feedbackTarget.id}
              feedbackTarget={feedbackTarget}
              divider={i < feedbackTargets.length - 1}
            />
          )
        })
      )}
    </List>
  )
}
export default FeedbackTargetList
