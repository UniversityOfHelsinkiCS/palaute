import React, { useMemo } from 'react'
import { Box, List, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import useCourseUnitFeedbackTargets from '../../../hooks/useCourseUnitFeedbackTargets'

import { getRelevantFeedbackTargets, getFeedbackTargetQueryOptions } from './utils'

import FeedbackTargetItem from './FeedbackTargetItem'
import { LoadingProgress } from '../../../components/common/LoadingProgress'

const FeedbackTargetList = ({ courseCode, group }) => {
  const { t } = useTranslation()

  const { feedbackTargets, isLoading } = useCourseUnitFeedbackTargets(courseCode, getFeedbackTargetQueryOptions(group))

  const targets = useMemo(() => getRelevantFeedbackTargets(feedbackTargets ?? []), [feedbackTargets])

  if (isLoading) {
    return <LoadingProgress />
  }

  if (targets.length === 0) {
    return (
      <Box p={2}>
        <Typography color="textSecondary" align="center">
          {t('teacherView:noCourseRealisations')}
        </Typography>
      </Box>
    )
  }

  return (
    <List>
      {targets.map((target, i) => (
        <FeedbackTargetItem key={target.id} feedbackTarget={target} divider={i < targets.length - 1} />
      ))}
    </List>
  )
}

export default FeedbackTargetList
