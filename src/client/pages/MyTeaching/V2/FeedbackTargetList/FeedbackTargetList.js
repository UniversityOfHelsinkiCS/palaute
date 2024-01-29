import React from 'react'
import { Box, List, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import useCourseUnitFeedbackTargets from '../../../../hooks/useCourseUnitFeedbackTargets'

import { getRelevantFeedbackTargets, getFeedbackTargetQueryOptions } from '../../utils'

import FeedbackTargetListItem from './FeedbackTargetListItem'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'

const FeedbackTargetList = ({ courseCode, group }) => {
  const { t } = useTranslation()

  const { feedbackTargets, isLoading } = useCourseUnitFeedbackTargets(courseCode, getFeedbackTargetQueryOptions(group))

  const targets = getRelevantFeedbackTargets(feedbackTargets ?? [])

  return (
    <List>
      {isLoading && <LoadingProgress />}

      {!isLoading && targets?.length === 0 ? (
        <Box p={2}>
          <Typography color="textSecondary" align="center">
            {t('teacherView:noCourseRealisations')}
          </Typography>
        </Box>
      ) : (
        targets.map((target, i) => (
          <FeedbackTargetListItem key={target.id} feedbackTarget={target} divider={i < targets.length - 1} />
        ))
      )}
    </List>
  )
}

export default FeedbackTargetList
