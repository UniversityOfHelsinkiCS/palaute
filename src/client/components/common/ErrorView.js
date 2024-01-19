import React from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Alert, Box, Link as MuiLink, Typography } from '@mui/material'
import { KeyboardReturnOutlined } from '@mui/icons-material'

import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { getLanguageValue } from '../../util/languageUtils'
import { getDateRangeString } from '../../util/getDateRangeString'
import { getCourseCode, getPrimaryCourseName } from '../../util/courseIdentifiers'
import { useFeedbackTargetErrorViewDetails } from '../../hooks/useFeedbackTargetErrorViewDetails'

const ForbiddenErrorDetails = ({ errorMessage, feedbackTargetId }) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isLoading } = useFeedbackTargetErrorViewDetails(feedbackTargetId)

  if (!feedbackTarget || isLoading) return null

  const { courseUnit, courseRealisation } = feedbackTarget || {}

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
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
    ? 'Kurssi on päättynyt yli vuosi sitten, eikä siihen voi enää antaa palautetta.'
    : isEnded
    ? 'Kurssi on päättynyt, eikä siihen voi enää antaa palautetta.'
    : 'Kurssin palaute ei ole vielä avautunut.'

  return (
    <Box sx={{ marginBottom: '2rem' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'end',
          columnGap: '1rem',
          rowGap: '0.3rem',
          marginBottom: '2rem',
        }}
      >
        <Typography variant="h4" component="h1">
          {primaryCourseName}
        </Typography>
        <Typography component="h2" variant="h5" color="textSecondary">
          {courseCode}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">{message}</Typography>
        <Typography variant="body1">{errorMessage}</Typography>
      </Box>
    </Box>
  )
}

/**
 * Display this with an appropriate message
 * when a component cannot be shown
 * because of a request error
 */
const ErrorView = ({ children, message, response, returnTo = '/feedbacks' }) => {
  const { t } = useTranslation()
  const { id } = useParams()

  const supportEmail = t('links:supportEmail')

  return (
    <Box m={4}>
      {response.status === 403 ? (
        <ForbiddenErrorDetails errorMessage={t(message)} feedbackTargetId={id} />
      ) : (
        <Typography variant="body1">{t(message)}</Typography>
      )}
      {response && (
        <Box>
          <Typography color="textSecondary" variant="subtitle1">
            {response.status} {response.statusText}
          </Typography>
        </Box>
      )}

      <Box mb={3} />
      <MuiLink to={returnTo} component={Link} underline="hover">
        <Box display="flex">
          {t('common:goBack')}
          <Box mr={1} />
          <KeyboardReturnOutlined />
        </Box>
      </MuiLink>
      <Box my={2}>{children}</Box>
      <Box mt={4}>
        <Alert variant="standard" severity="info">
          {t('common:supportContact')}
          <MuiLink href={`mailto:${supportEmail}`} underline="hover">
            {supportEmail}
          </MuiLink>
        </Alert>
      </Box>
    </Box>
  )
}

export default ErrorView
