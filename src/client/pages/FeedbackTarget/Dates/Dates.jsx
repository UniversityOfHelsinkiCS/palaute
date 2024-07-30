import React from 'react'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { getDateRangeString } from '../../../util/getDateRangeString'

const FeedbackTargetDates = ({ ...props }) => {
  const { t } = useTranslation()
  const { feedbackTarget } = useFeedbackTargetContext()
  const { courseRealisation, opensAt, closesAt, continuousFeedbackEnabled, userCreated } = feedbackTarget

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(opensAt, closesAt)

  return (
    <Box>
      <Box
        {...props}
        component="dl"
        rowGap="0.5rem"
        sx={theme => ({
          display: 'flex',
          flexDirection: 'column',
          [theme.breakpoints.up('md')]: { display: 'grid', gridTemplateColumns: '9rem auto' },
        })}
      >
        {!userCreated && (
          <>
            <Typography color="textSecondary" component="dt">
              {t('feedbackTargetView:coursePeriod')}:
            </Typography>

            <Typography color="textSecondary" component="dd">
              {coursePeriod}
            </Typography>
          </>
        )}

        <Typography color="textSecondary" component="dt">
          {t('feedbackTargetView:feedbackPeriod')}:
        </Typography>

        <Typography color="textSecondary" component="dd">
          {feedbackPeriod}
        </Typography>

        {continuousFeedbackEnabled && (
          <>
            <Typography color="textSecondary" component="dt">
              {t('feedbackTargetView:continuousFeedbackTab')}:
            </Typography>

            <Typography color="textSecondary" component="dd">
              {coursePeriod}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  )
}

export default FeedbackTargetDates
