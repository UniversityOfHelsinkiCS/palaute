import React from 'react'

import { useTranslation } from 'react-i18next'

import { Box, Typography } from '@mui/material'

import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { getLanguageValue } from '../../util/languageUtils'
import { getDateRangeString } from '../../util/getDateRangeString'
import { getCourseCode, getPrimaryCourseName } from '../../util/courseIdentifiers'
import { useFeedbackTargetErrorViewDetails } from '../../hooks/useFeedbackTargetErrorViewDetails'

const ForbiddenErrorDetails = ({ feedbackTargetId }) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isLoading } = useFeedbackTargetErrorViewDetails(feedbackTargetId)

  if (!feedbackTarget || isLoading) return null

  const { courseUnit, courseRealisation, userCreated } = feedbackTarget || {}

  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(feedbackTarget.opensAt, feedbackTarget.closesAt)

  const courseCode = getCourseCode(courseUnit)
  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )

  // eslint-disable-next-line no-nested-ternary
  const message = isOld
    ? 'Palauteaika on päättynyt yli vuosi sitten, eikä kurssille voi enää antaa palautetta. Tarkista ylläolevista tiedoista, että kurssi on oikea.'
    : isEnded
    ? 'Palauteaika on päättynyt, eikä kurssille voi enää antaa palautetta. Tarkista ylläolevista tiedoista, että kurssi on oikea.'
    : 'Emme löytäneet ilmoittautumistasi tälle kurssille. Mikäli olet ilmoittaunut äskeittäin, saatat joutua odottamaan noin 1-2 tuntia.'

  return (
    <Box sx={{ marginBottom: '2rem' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'end',
          columnGap: '1rem',
          rowGap: '0.3rem',
          marginBottom: '1rem',
        }}
      >
        <Typography variant="h4" component="h1">
          {primaryCourseName}
        </Typography>
        <Typography component="h2" variant="h5" color="textSecondary">
          {courseCode}
        </Typography>
      </Box>

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
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Box>
  )
}

export default ForbiddenErrorDetails
