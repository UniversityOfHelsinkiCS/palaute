import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import {
  Box,
  CircularProgress,
  Typography,
  Tab,
  Button,
  makeStyles,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'

import EditFeedbackTarget from '../EditFeedbackTarget'
import FeedbackTargetResults from '../FeedbackTargetResults'
import FeedbackView from '../FeedbackView'
import StudentsWithFeedback from '../StudentsWithFeedback'
import FeedbackResponse from '../FeedbackResponse'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import RouterTabs from '../RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import ExternalLink from '../ExternalLink'

import {
  getCoursePeriod,
  feedbackTargetIsDisabled,
  copyLink,
  getFeedbackPeriod,
  getCoursePageUrl,
} from './utils'

const useStyles = makeStyles((theme) => ({
  datesContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    margin: '0px',
    '& dt': {
      paddingRight: theme.spacing(1),
      gridColumn: 1,
    },
    '& dd': {
      gridColumn: 2,
    },
  },
  headingContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  },
  copyLinkButtonContainer: {
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
    },
    '@media print': {
      display: 'none',
    },
  },
  coursePageLink: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    '@media print': {
      display: 'none',
    },
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
}))

const FeedbackTargetView = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id)
  const classes = useStyles()

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const {
    accessStatus,
    courseRealisation,
    opensAt,
    feedback,
    studentListVisible,
    responsibleTeachers,
  } = feedbackTarget

  const { courseCode } = feedbackTarget.courseUnit

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isTeacher = accessStatus === 'TEACHER'
  const isDisabled = feedbackTargetIsDisabled(feedbackTarget)
  const showFeedbacksTab = (isTeacher && isStarted) || feedback || isEnded

  const showEditSurveyTab = isTeacher && !isOpen && !isEnded
  const showFeedbackResponseTab = isTeacher && isEnded
  const showStudentsWithFeedbackTab = isTeacher && studentListVisible && isEnded

  const handleCopyLink = () => {
    copyLink(feedbackTarget)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  if (isDisabled && !isTeacher) {
    enqueueSnackbar(t('feedbackTargetView:feedbackDisabled'), {
      variant: 'error',
    })

    return <Redirect to="/" />
  }

  const coursePeriod = getCoursePeriod(courseRealisation)
  const feedbackPeriod = getFeedbackPeriod(feedbackTarget)
  const coursePageUrl = getCoursePageUrl(feedbackTarget)

  const courseRealisationName = getLanguageValue(
    courseRealisation?.name,
    i18n.language,
  )

  const visibleCourseCode =
    courseRealisationName.indexOf(courseCode) > -1 ? '' : `, ${courseCode}`

  return (
    <>
      <Box mb={2}>
        <div className={classes.headingContainer}>
          <Typography variant="h4" component="h1">
            {courseRealisationName}
            {visibleCourseCode}
          </Typography>

          {isTeacher && (
            <div className={classes.copyLinkButtonContainer}>
              <Button
                startIcon={<CopyIcon />}
                color="primary"
                onClick={handleCopyLink}
              >
                {t('feedbackTargetView:copyLink')}
              </Button>
            </div>
          )}
        </div>
        <div className={classes.infoContainer}>
          <div>
            <dl className={classes.datesContainer}>
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
            </dl>

            <ExternalLink
              href={coursePageUrl}
              className={classes.coursePageLink}
            >
              {t('feedbackTargetView:coursePage')}
            </ExternalLink>
          </div>
          <div>
            {responsibleTeachers && (
              <div>
                <Typography>Responsible teachers</Typography>
                {responsibleTeachers.map((teacher) => (
                  <Typography
                    key={teacher.id}
                    color="textSecondary"
                    variant="body2"
                    component="p"
                  >
                    {teacher.firstName} {teacher.lastName}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        </div>
      </Box>

      <Box mb={2} className={classes.hidePrint}>
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

          {showFeedbackResponseTab && (
            <Tab
              label={t('feedbackTargetView:feedbackResponseTab')}
              component={Link}
              to={`${url}/feedback-response`}
            />
          )}

          {showEditSurveyTab && (
            <Tab
              label={t('feedbackTargetView:editSurveyTab')}
              component={Link}
              to={`${url}/edit`}
            />
          )}

          {showStudentsWithFeedbackTab && (
            <Tab
              label={t('feedbackTargetView:studentsWithFeedbackTab')}
              component={Link}
              to={`${url}/students-with-feedback`}
            />
          )}
        </RouterTabs>
      </Box>

      <Switch>
        <Route path={`${path}/edit`} component={EditFeedbackTarget} />
        <Route path={`${path}/results`} component={FeedbackTargetResults} />
        <Route path={`${path}/feedback`} component={FeedbackView} />
        <Route
          path={`${path}/students-with-feedback`}
          component={StudentsWithFeedback}
        />
        <Route
          path={`${path}/feedback-response`}
          component={FeedbackResponse}
        />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default FeedbackTargetView
