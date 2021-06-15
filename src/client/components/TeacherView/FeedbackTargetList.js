import React, { useMemo } from 'react'
import { Box, CircularProgress, List, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'

import {
  getRelevantFeedbackTargets,
  getFeedbackTargetQueryOptions,
} from './utils'

import FeedbackTargetItem from './FeedbackTargetItem'

const FeedbackTargetList = ({ courseCode, group }) => {
  const { t } = useTranslation()

  const { feedbackTargets, isLoading } = useCourseUnitFeedbackTargets(
    courseCode,
    getFeedbackTargetQueryOptions(group),
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
          {t('teacherView:noCourseRealisations')}
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
