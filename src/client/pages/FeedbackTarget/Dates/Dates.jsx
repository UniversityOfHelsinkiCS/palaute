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
    <Stack direction="column" spacing={1}>
      <Typography fontWeight="bold">{t('feedbackTargetView:information')}</Typography>
      {!userCreated && (
        <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
          <Typography color="textSecondary" component="dt">
            {t('feedbackTargetView:coursePeriod')}:
          </Typography>
          <Typography color="textSecondary" component="dd">
            {coursePeriod}
          </Typography>
        </Box>
      )}
      <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
        <Typography color="textSecondary" component="dt">
          {t('feedbackTargetView:feedbackPeriod')}:
        </Typography>
        <Typography color="textSecondary" component="dd">
          {feedbackPeriod}
        </Typography>
      </Box>
      {isStudent && continuousFeedbackEnabled && (
        <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem">
          <Typography color="textSecondary" component="dt">
            {t('feedbackTargetView:continuousFeedbackTab')}:
          </Typography>
          <Typography color="textSecondary" component="dd">
            {coursePeriod}
          </Typography>
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
              <Typography color="textSecondary" component="dt">
                {t('feedbackTargetView:continuousFeedbackTab')}:
              </Typography>
              <Chip
                label={continuousFeedbacks.length}
                variant={continuousFeedbacks.length ? 'filled' : 'outlined'}
                color={continuousFeedbacks.length ? 'primary' : 'lightGray'}
                sx={{ paddingLeft: '6px', paddingRight: '6px' }}
              />
            </Box>
          )}
          <Box data-cy={`${dataCyPrefix}feedback-target-feedback-count`} display="flex" gap="1rem" alignItems="center">
            <Typography color="textSecondary">{t('feedbackTargetView:studentsWithFeedbackTab')}:</Typography>
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
