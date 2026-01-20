import React from 'react'
import { Link } from 'react-router'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { getDateRangeString } from '../../../util/getDateRangeString'
import useFeedbackTargetContinuousFeedbacks from '../../../hooks/useFeedbackTargetContinuousFeedbacks'
import PercentageCell from '../../CourseSummary/components/PercentageCell'
import EditFeedbackTargetDates from './EditFeedbackTarget'

const FeedbackTargetDatesAndCounts = ({ isCourseFeedback, dataCyPrefix = '' }) => {
  const { t } = useTranslation()
  const { feedbackTarget, isTeacher, isStudent, isAdmin, isResponsibleTeacher, isOrganisationAdmin } =
    useFeedbackTargetContext()
  const { id, courseRealisation, opensAt, closesAt, userCreated, continuousFeedbackEnabled, summary } = feedbackTarget

  const hookIsEnabled = isStudent || isTeacher || isAdmin || isResponsibleTeacher || isOrganisationAdmin
  const { continuousFeedbacks } = useFeedbackTargetContinuousFeedbacks(feedbackTarget.id, hookIsEnabled)

  const feedbackCount = summary?.data?.feedbackCount ?? 0
  const studentCount = summary?.data?.studentCount ?? 0

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(opensAt, closesAt)

  return (
    <Stack direction="column" spacing={2}>
      <Box component="dl" data-cy={`${dataCyPrefix}feedback-target-feedback-dates`}>
        {!userCreated && (
          <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem" sx={{ mb: 2 }}>
            <Typography component="dt">{t('feedbackTargetView:coursePeriod')}:</Typography>
            <Typography component="dd">{coursePeriod}</Typography>
          </Box>
        )}
        <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem" alignItems="center">
          <Typography component="dt">{t('feedbackTargetView:feedbackPeriod')}:</Typography>
          <Typography component="dd">{feedbackPeriod}</Typography>
          {isTeacher && isCourseFeedback && <EditFeedbackTargetDates />}
        </Box>
        {isStudent && continuousFeedbackEnabled && (
          <Box display="flex" flexWrap="wrap" columnGap="1rem" rowGap="0.3rem" sx={{ mt: 2 }}>
            <Typography component="dt">{t('feedbackTargetView:continuousFeedbackTab')}:</Typography>
            <Typography component="dd">{coursePeriod}</Typography>
          </Box>
        )}
      </Box>
      {isTeacher && (
        <>
          {continuousFeedbackEnabled && continuousFeedbacks && (
            <Box
              data-cy={`${dataCyPrefix}feedback-target-feedback-count`}
              display="flex"
              gap="1rem"
              alignItems="center"
            >
              <Typography>{t('feedbackTargetView:continuousFeedbackGiven')}:</Typography>
              <Chip
                clickable
                component={Link}
                to={`/targets/${id}/continuous-feedback`}
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
              linkTo={`/targets/${id}/results`}
            />
          </Box>
        </>
      )}
    </Stack>
  )
}

export default FeedbackTargetDatesAndCounts
