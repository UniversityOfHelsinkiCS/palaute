import React from 'react'
import { Box, List, Typography, Stack, Skeleton } from '@mui/material'
import { useTranslation } from 'react-i18next'

import useCourseUnitFeedbackTargets from '../../../../hooks/useCourseUnitFeedbackTargets'

import { getRelevantFeedbackTargets, getFeedbackTargetQueryOptions } from '../../utils'

import FeedbackTargetListItem from './FeedbackTargetListItem'

const FeedbackTargetList = ({ courseCode, group }) => {
  const { t } = useTranslation()

  const { feedbackTargets, isLoading } = useCourseUnitFeedbackTargets(courseCode, getFeedbackTargetQueryOptions(group))

  const targets = getRelevantFeedbackTargets(feedbackTargets ?? [])

  return (
    <List sx={{ margin: 0, padding: 0 }}>
      {isLoading && (
        <Stack sx={{ p: 2 }}>
          <Skeleton variant="rounded" height={50} />
          <Skeleton>
            <Typography>Kurssi käynnissä: xx.xx.xxxx - xx.xx.xxxx</Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body2">Palautejakso ei ole vielä alkanut</Typography>
          </Skeleton>
        </Stack>
      )}

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
