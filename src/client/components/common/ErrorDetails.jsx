/* eslint-disable no-nested-ternary */
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Typography } from '@mui/material'

import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { getLanguageValue } from '../../util/languageUtils'
import { getDateRangeString } from '../../util/getDateRangeString'
import { getCourseCode, getPrimaryCourseName, getSecondaryCourseName } from '../../util/courseIdentifiers'
import { useFeedbackTargetErrorViewDetails } from '../../hooks/useFeedbackTargetErrorViewDetails'

const ErrorDetails = ({ feedbackTargetId, message, response }) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isLoading } = useFeedbackTargetErrorViewDetails(feedbackTargetId)

  if (!feedbackTarget || isLoading) {
    return (
      <Box sx={{ mb: '2rem' }}>
        <Typography variant="body1">{t(message)}</Typography>
      </Box>
    )
  }

  const { courseUnit, courseRealisation, userCreated } = feedbackTarget || {}

  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(feedbackTarget.opensAt, feedbackTarget.closesAt)

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )

  const secondaryCourseName = getLanguageValue(
    getSecondaryCourseName(courseRealisation, courseUnit, feedbackTarget),
    i18n.language
  )

  const courseCode = getCourseCode(courseUnit)
  const visibleCourseCode = primaryCourseName.indexOf(courseCode) > -1 ? '' : courseCode

  const unauthorizedMessage = () =>
    isOld
      ? 'feedbackTargetView:noAccessOldCourse'
      : isEnded
      ? 'feedbackTargetView:noAccessEndedCourse'
      : 'feedbackTargetView:noAccess'

  return (
    <Box sx={{ mb: '2rem' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'end',
          columnGap: '1rem',
          rowGap: '0.3rem',
          mb: '1rem',
        }}
      >
        <Typography variant="h4" component="h1">
          {primaryCourseName}
        </Typography>
        <Typography component="h2" variant="h5" color="textSecondary">
          {visibleCourseCode}
        </Typography>
      </Box>

      <Typography variant="body1" component="h2">
        {secondaryCourseName}
      </Typography>

      <Box
        component="dl"
        sx={theme => ({
          display: 'flex',
          flexDirection: 'column',
          rowGap: '0.5rem',
          marginBottom: '2rem',
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
      </Box>
      <Box>
        <Typography variant="body1">{response.status === 403 ? t(unauthorizedMessage()) : t(message)}</Typography>
      </Box>
    </Box>
  )
}

export default ErrorDetails
