import React from 'react'
/** @jcssImportSource @emotion/react */

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import { Box, Typography, Tab } from '@mui/material'

import { useTranslation } from 'react-i18next'
import { RouterTabs } from '../common/RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import GuestFeedbackView from './GuestFeedbackView'
import GuestFeedbackTargetResults from './GuestFeedbackTargetResults'

import ExternalLink from '../common/ExternalLink'

import { getCoursePageUrl, getCoursePeriod, getFeedbackPeriod } from './utils'
import { LoadingProgress } from '../common/LoadingProgress'

const styles = {
  datesContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    margin: '0px',
    '& dt': {
      paddingRight: (theme) => theme.spacing(1),
      gridColumn: 1,
    },
    '& dd': {
      gridColumn: 2,
    },
  },
  headingContainer: (theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  }),
  copyLinkButtonContainer: (theme) => ({
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
    },
  }),
  coursePageLink: {
    display: 'inline-block',
    marginTop: (theme) => theme.spacing(1),
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
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })
  useAutoselectLanguage(feedbackTarget, (lang) => i18n.changeLanguage(lang))

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Redirect to="/noad/courses" />
  }

  const { accessStatus, courseRealisation, opensAt, feedback } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isTeacher = accessStatus === 'TEACHER'
  const showFeedbacksTab = (isTeacher && isStarted) || feedback || isEnded

  const coursePeriod = getCoursePeriod(courseRealisation)
  const feedbackPeriod = getFeedbackPeriod(feedbackTarget)
  const coursePageUrl = getCoursePageUrl(feedbackTarget)

  const courseRealisationName = getLanguageValue(
    courseRealisation?.name,
    i18n.language,
  )

  return (
    <>
      <Box mb={2}>
        <Box sx={styles.headingContainer}>
          <Typography variant="h4" component="h1">
            {courseRealisationName}
          </Typography>
        </Box>

        <Box sx={styles.datesContainer}>
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
        <RouterTabs
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              feedback && isOpen
                ? t('feedbackTargetView:editFeedbackTab')
                : t('feedbackTargetView:surveyTab')
            }
            component={Link}
            to={`${url}/feedback`}
          />
          {showFeedbacksTab && (
            <Tab
              label={t('feedbackTargetView:feedbacksTab')}
              component={Link}
              to={`${url}/results`}
            />
          )}
        </RouterTabs>
      </Box>
      <Switch>
        <Route path={`${path}/feedback`} component={GuestFeedbackView} />
        <Route
          path={`${path}/results`}
          component={GuestFeedbackTargetResults}
        />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default GuestFeedbackTargetView
