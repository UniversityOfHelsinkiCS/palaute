import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { getDateRangeString } from '../../../util/getDateRangeString'
import useFeedbackTargetContinuousFeedbacks from '../../../hooks/useFeedbackTargetContinuousFeedbacks'
import PercentageCell from '../../CourseSummary/components/PercentageCell'

const FeedbackTargetDatesAndCounts = ({ dataCyPrefix = '' }) => {
  const { t } = useTranslation()
  const { feedbackTarget, isTeacher, isStudent } = useFeedbackTargetContext()
  const { courseRealisation, opensAt, closesAt, userCreated, continuousFeedbackEnabled, summary } = feedbackTarget

  const { continuousFeedbacks } = useFeedbackTargetContinuousFeedbacks(feedbackTarget.id)

  const feedbackCount = summary?.data?.feedbackCount ?? 0
  const studentCount = summary?.data?.studentCount ?? 0

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(opensAt, closesAt)

  return (
    <Stack direction="column" spacing={2}>
      {!userCreated && (
        <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
          <Typography component="dt">{t('feedbackTargetView:coursePeriod')}:</Typography>
          <Typography component="dd">{coursePeriod}</Typography>
        </Box>
      )}
      <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
        <Typography component="dt">{t('feedbackTargetView:feedbackPeriod')}:</Typography>
        <Typography component="dd">{feedbackPeriod}</Typography>
      </Box>
      {isStudent && continuousFeedbackEnabled && (
        <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
          <Typography component="dt">{t('feedbackTargetView:continuousFeedbackTab')}:</Typography>
          <Typography component="dd">{coursePeriod}</Typography>
        </Box>
      )}
      {isTeacher && (
        <>
          {continuousFeedbackEnabled && continuousFeedbacks && (
            <Box
              data-cy={`${dataCyPrefix}feedback-target-feedback-count`}
              display="flex"
              gap="1rem"
              alignItems="center"
            >
              <Typography component="dt">{t('feedbackTargetView:continuousFeedbackGiven')}:</Typography>
              <Chip
                label={continuousFeedbacks.length}
                variant={continuousFeedbacks.length ? 'filled' : 'outlined'}
                color={continuousFeedbacks.length ? 'primary' : 'lightGray'}
                sx={{ paddingLeft: '6px', paddingRight: '6px' }}
              />
            </Box>
          )}
          <Box data-cy={`${dataCyPrefix}feedback-target-feedback-count`} display="flex" gap="1rem" alignItems="center">
            <Typography>{t('feedbackTargetView:respondents')}:</Typography>
            <PercentageCell
              data-cy={`${dataCyPrefix}feedback-target-feedback-count-percentage`}
              label={`${feedbackCount}/${studentCount}`}
              percent={(feedbackCount / studentCount) * 100}
              tooltip={t('common:feedbacksGivenRatio')}
            />
          </Box>
        </>
      )}
    </Stack>
  )
}

export default FeedbackTargetDatesAndCounts
