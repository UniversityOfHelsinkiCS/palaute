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
  Typography,
  Tab,
  Button,
  Link as MuiLink,
  Chip,
  makeStyles,
  Tooltip,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'
import {
  CommentOutlined,
  EditOutlined,
  LiveHelpOutlined,
  PeopleOutlined,
  PollOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@material-ui/icons'

import EditFeedbackTarget from '../EditFeedbackTarget'
import FeedbackTargetResults from '../FeedbackTargetResults'
import FeedbackView from '../FeedbackView'
import StudentsWithFeedback from '../StudentsWithFeedback'
import EditFeedbackResponse from '../EditFeedbackResponse'
import FeedbackTargetLinks from '../FeedbackTargetLinks'
import FeedbackLinksView from '../FeedbackLinksView'
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
  getCourseUnitSummaryPath,
  deleteResponsibleTeacher,
} from './utils'

import { LoadingProgress } from '../LoadingProgress'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import FeedbackTargetSettings from '../FeedbackTargetSettings'
import useFeedbackCount from '../../hooks/useFeedbackCount'

const useStyles = makeStyles((theme) => ({
  datesContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
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
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
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

const ResponsibleTeachersList = ({ teachers, isAdmin, onDelete }) => {
  const list = teachers.map((teacher) => {
    const displayName = `${teacher.firstName} ${teacher.lastName}`

    return isAdmin ? (
      <Box mb={1} key={teacher.id}>
        <Chip
          label={displayName}
          variant="outlined"
          onDelete={() => onDelete(teacher)}
        />
      </Box>
    ) : (
      <Typography
        key={teacher.id}
        color="textSecondary"
        variant="body2"
        component="p"
      >
        {displayName}
      </Typography>
    )
  })

  return <div>{list}</div>
}

const FeedbackTargetView = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget, isLoading, refetch } = useFeedbackTarget(id)
  const { feedbackCount, isLoading: feedbackCountLoading } = useFeedbackCount(
    id,
    {
      enabled: !isLoading && feedbackTarget?.accessStatus === 'TEACHER',
    },
  )
  const { authorizedUser } = useAuthorizedUser()
  const isAdmin = authorizedUser?.isAdmin ?? false
  const classes = useStyles()

  if (isLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const {
    accessStatus,
    courseRealisation,
    courseUnit,
    opensAt,
    feedback,
    studentListVisible,
    responsibleTeachers,
    feedbackResponseEmailSent,
  } = feedbackTarget

  const { courseCode } = courseUnit

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isTeacher = accessStatus === 'TEACHER'
  const isDisabled = feedbackTargetIsDisabled(feedbackTarget)

  const showCourseSummaryLink = !feedbackCountLoading && feedbackCount > 0

  const showFeedbacksTab = (isTeacher && isStarted) || feedback || isEnded
  const showEditSurveyTab = isTeacher && !isOpen && !isEnded
  const showEditFeedbackResponseTab =
    isTeacher && isEnded && !feedbackResponseEmailSent
  const showStudentsWithFeedbackTab =
    isTeacher && studentListVisible && (isOpen || isEnded)
  const showLinksTab = isTeacher
  const showSettingsTab = isTeacher

  const handleCopyLink = () => {
    copyLink(`${window.location.host}/targets/${id}/feedback`)
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
  const courseSummaryPath = getCourseUnitSummaryPath(feedbackTarget)

  const courseRealisationName = getLanguageValue(
    courseRealisation?.name,
    i18n.language,
  )

  const courseUnitName = getLanguageValue(courseUnit?.name, i18n.language)

  const visibleCourseCode =
    courseRealisationName.indexOf(courseCode) > -1 ? '' : `, ${courseCode}`

  const handleDeleteResponsibleTeacher = async (teacher) => {
    const displayName = `${teacher.firstName} ${teacher.lastName}`

    const message = t(
      'feedbackTargetView:deleteResponsibleTeacherConfirmation',
      { name: displayName },
    )

    // eslint-disable-next-line no-alert
    if (window.confirm(message)) {
      try {
        await deleteResponsibleTeacher(feedbackTarget, teacher)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }

      refetch()
    }
  }

  return (
    <>
      <Box mb={3}>
        <div className={classes.headingContainer}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h4" component="h1">
              {courseUnitName}
              {visibleCourseCode}
            </Typography>
            <Box mt={1} />
            <Typography variant="body1" component="h2">
              {courseRealisationName}
            </Typography>
          </Box>
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

            <Box display="flex" className={classes.hidePrint}>
              <ExternalLink href={coursePageUrl}>
                {t('feedbackTargetView:coursePage')}
              </ExternalLink>

              <Box ml={2} />
              {isTeacher && showCourseSummaryLink && (
                <MuiLink to={courseSummaryPath} component={Link}>
                  {t('feedbackTargetView:courseSummary')}
                </MuiLink>
              )}
            </Box>
          </div>
          <div>
            {responsibleTeachers && (
              <div>
                <Typography gutterBottom>
                  {t('feedbackTargetView:responsibleTeachers')}
                </Typography>

                <ResponsibleTeachersList
                  teachers={responsibleTeachers}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteResponsibleTeacher}
                />
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
              feedback && isOpen ? (
                <TabLabel
                  icon={<EditOutlined />}
                  text={t('feedbackTargetView:editFeedbackTab')}
                />
              ) : (
                <TabLabel
                  icon={<LiveHelpOutlined />}
                  text={t('feedbackTargetView:surveyTab')}
                />
              )
            }
            component={Link}
            to={`${url}/feedback`}
          />
          {showFeedbacksTab && (
            <RouterTab
              icon={<PollOutlined />}
              label={t('feedbackTargetView:feedbacksTab')}
              to={`${url}/results`}
            />
          )}
          {showEditFeedbackResponseTab && (
            <RouterTab
              icon={<EditOutlined />}
              label={t('feedbackTargetView:editFeedbackResponseTab')}
              to={`${url}/edit-feedback-response`}
            />
          )}
          {showEditSurveyTab && (
            <RouterTab
              icon={<EditOutlined />}
              label={t('feedbackTargetView:editSurveyTab')}
              to={`${url}/edit`}
            />
          )}
          {showStudentsWithFeedbackTab && (
            <RouterTab
              icon={<PeopleOutlined />}
              label={t('feedbackTargetView:studentsWithFeedbackTab')}
              to={`${url}/students-with-feedback`}
            />
          )}
          {showLinksTab && (
            <RouterTab
              icon={<ShareOutlined />}
              label={t('feedbackTargetView:shareTab')}
              to={`${url}/share`}
            />
          )}
          {showSettingsTab && (
            <RouterTab
              icon={<SettingsOutlined />}
              label={t('feedbackTargetView:surveySettingsTab')}
              to={`${url}/settings`}
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
        <Route path={`${path}/share`} component={FeedbackTargetLinks} />
        <Route path={`${path}/togen`} component={FeedbackLinksView} />
        <Route
          path={`${path}/edit-feedback-response`}
          component={EditFeedbackResponse}
        />
        <Route path={`${path}/settings`} component={FeedbackTargetSettings} />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

const RouterTab = ({ icon, label, to, disabled, disabledTooltip }) => {
  const content = icon ? (
    <Box display="flex">
      {icon}
      <Box ml={1} />
      {label}
    </Box>
  ) : (
    label
  )

  const tab = (
    <Tab label={content} component={Link} to={to} disabled={disabled} />
  )

  if (disabled)
    return (
      <Tooltip title={disabledTooltip} placement="top">
        <Box>{tab}</Box>
      </Tooltip>
    )
  return tab
}

const TabLabel = ({ icon, text }) => (
  <Box display="flex">
    {icon}
    <Box ml={1} />
    {text}
  </Box>
)

export default FeedbackTargetView
