import React from 'react'
/** @jcssImportSource @emotion/react */

import { Route, useParams, Link, Routes, Navigate, useMatch } from 'react-router-dom'

import { Box, Typography, Tab } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { RouterTabs } from '../../components/common/RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import GuestFeedbackView from './GuestFeedbackView'
import GuestFeedbackTargetResults from './GuestFeedbackTargetResults'

import ExternalLink from '../../components/common/ExternalLink'

import { getCoursePeriod, getFeedbackPeriod } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getPrimaryCourseName, getSecondaryCourseName } from '../../util/courseIdentifiers'

const styles = {
  datesContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    margin: '0px',
    '& dt': {
      paddingRight: theme => theme.spacing(1),
      gridColumn: 1,
    },
    '& dd': {
      gridColumn: 2,
    },
  },
  headingContainer: theme => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mt: 4,
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  }),
  copyLinkButtonContainer: theme => ({
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
    },
  }),
  coursePageLink: {
    display: 'inline-block',
    marginTop: theme => theme.spacing(1),
  },
}

/**
 * Sets the UI language to the feedbackTarget teaching language if it has only 1
 * @param {FeedbackTarget} feedbackTarget
 * @param {(language: string) => void} changeLanguage
 */
const useAutoselectLanguage = (feedbackTarget, changeLanguage) => {
  React.useEffect(() => {
    if (!feedbackTarget?.courseRealisation) return
    if (feedbackTarget.courseRealisation.teachingLanguages?.length !== 1) return
    changeLanguage(feedbackTarget.courseRealisation.teachingLanguages[0])
  }, [feedbackTarget])
}

const GuestFeedbackTargetView = () => {
  const { id } = useParams()
  const { pathnameBase } = useMatch('/noad/targets/:id/*')
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })
  useAutoselectLanguage(feedbackTarget, lang => i18n.changeLanguage(lang))

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Navigate to="/noad/courses" />
  }

  const { accessStatus, courseUnit, courseRealisation, opensAt, feedback } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isTeacher = accessStatus.includes('TEACHER') || accessStatus.includes('RESPONSIBLE_TEACHER')
  const showFeedbacksTab = (isTeacher && isStarted) || feedback || isEnded

  const coursePeriod = getCoursePeriod(courseRealisation)
  const feedbackPeriod = getFeedbackPeriod(feedbackTarget)
  const coursePageUrl = `${t('links:courseRealisationPage')}${feedbackTarget.courseRealisation.id}`

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const secondaryCourseName = getSecondaryCourseName(courseRealisation, courseUnit, feedbackTarget, i18n.language)

  return (
    <>
      <Box mb={2}>
        <Box sx={styles.headingContainer}>
          <Typography variant="h4" component="h1">
            {primaryCourseName}
          </Typography>

          <Typography variant="body1" component="h2" sx={{ mr: '1rem' }}>
            {secondaryCourseName}
          </Typography>
        </Box>

        <Box sx={styles.datesContainer} component="dl">
          <Typography color="textSecondary" variant="body2" component="dt">
            {t('feedbackTargetView:coursePeriod')}:
          </Typography>

          <Typography color="textSecondary" variant="body2" component="dd">
            {coursePeriod}
          </Typography>

          <Typography color="textSecondary" variant="body2" component="dt">
            {t('feedbackTargetView:feedbackPeriod')}:
          </Typography>

          <Typography color="textSecondary" variant="body2" component="dd">
            {feedbackPeriod}
          </Typography>
        </Box>

        <ExternalLink href={coursePageUrl} sx={styles.coursePageLink}>
          {t('feedbackTargetView:coursePage')}
        </ExternalLink>
      </Box>
      <Box mb={2}>
        <RouterTabs indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab
            label={feedback && isOpen ? t('feedbackTargetView:editFeedbackTab') : t('feedbackTargetView:surveyTab')}
            component={Link}
            to={`${pathnameBase}/feedback`}
          />
          {showFeedbacksTab && (
            <Tab label={t('feedbackTargetView:feedbacksTab')} component={Link} to={`${pathnameBase}/results`} />
          )}
        </RouterTabs>
      </Box>
      <Routes>
        <Route path="/feedback" element={<GuestFeedbackView />} />
        <Route path="/results" element={<GuestFeedbackTargetResults />} />
        <Route path="*" element={<Navigate to="/feedback" />} />
      </Routes>
    </>
  )
}

export default GuestFeedbackTargetView
