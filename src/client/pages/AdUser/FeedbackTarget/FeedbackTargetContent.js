import React from 'react'
/** @jsxImportSource @emotion/react */

import {
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
  Alert,
} from '@mui/material'

import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import CopyIcon from '@mui/icons-material/FileCopyOutlined'
import {
  EditOutlined,
  ListOutlined,
  LiveHelpOutlined,
  PeopleOutlined,
  PollOutlined,
  ShareOutlined,
  ReviewsOutlined,
} from '@mui/icons-material'

import FeedbackTargetResults from '../../../components/FeedbackTargetResults'
import FeedbackView from '../../../components/FeedbackView'
import StudentsWithFeedback from '../../../components/StudentsWithFeedback'
import EditFeedbackResponse from '../../../components/EditFeedbackResponse'
import FeedbackTargetShare from '../../../components/FeedbackTargetShare'
import FeedbackLinksView from '../../../components/FeedbackLinksView'
import useCourseRealisationSummaries from '../../../hooks/useCourseRealisationSummaries'
import {
  RouterTab,
  RouterTabs,
  TabLabel,
} from '../../../components/common/RouterTabs'
import { getLanguageValue } from '../../../util/languageUtils'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import ExternalLink from '../../../components/common/ExternalLink'

import {
  getCoursePeriod,
  copyLink,
  getFeedbackPeriod,
  getCourseUnitSummaryPath,
  deleteResponsibleTeacher,
} from './utils'

import FeedbackTargetSettings from '../../../components/FeedbackTargetSettings'
import FeedbackTargetLogs from '../../../components/FeedbackTargetLogs'
import ContinuousFeedback from '../../../components/FeedbackTargetContinuousFeedback'
import TeacherChip from '../../../components/common/TeacherChip'
import { links } from '../../../util/links'
import PercentageCell from '../CourseSummary/PercentageCell'
import { TagChip } from '../../../components/common/TagChip'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import ErrorView from '../../../components/common/ErrorView'
import ProtectedRoute from '../../../components/common/ProtectedRoute'

const styles = {
  datesContainer: {
    display: 'grid',
    gridGap: '0.2rem',
    gridTemplateColumns: 'auto 1fr',
    '& dt': {
      paddingRight: 3,
      gridColumn: 1,
    },
    '& dd': {
      gridColumn: 2,
    },
  },
  headingContainer: (theme) => ({
    display: 'flex',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
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
    '@media print': {
      display: 'none',
    },
  }),
  infoContainer: (theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  }),
  teacherListContainer: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row',
    },
  }),
  linkContainer: (theme) => ({
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
    gap: '1.5rem',
  }),
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
}

const ResponsibleTeachersList = ({ teachers, isAdmin, onDelete }) => (
  <Box sx={styles.teacherListContainer}>
    {teachers.map((teacher) => (
      <TeacherChip
        key={teacher.id}
        user={teacher}
        onDelete={isAdmin ? () => onDelete(teacher) : undefined}
      />
    ))}
  </Box>
)

// TODO rewrite this shit as mutation
const handleDeleteTeacher = (feedbackTarget, t) => async (teacher) => {
  const displayName = `${teacher.firstName} ${teacher.lastName}`

  const message = t('feedbackTargetView:deleteResponsibleTeacherConfirmation', {
    name: displayName,
  })

  // eslint-disable-next-line no-alert
  if (window.confirm(message)) {
    try {
      await deleteResponsibleTeacher(feedbackTarget, teacher)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }
}

const FeedbackTargetContent = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const {
    feedbackTarget,
    organisation,
    isTeacher,
    isAdmin,
    isOrganisationAdmin,
    isResponsibleTeacher,
  } = useFeedbackTargetContext()

  // If link to cur summary should not be shown, gets empty response when failSilentry: true
  const { courseRealisationSummaries: showCourseSummaryLink } =
    useCourseRealisationSummaries(feedbackTarget.courseUnit.courseCode, {
      failSilently: true,
      enabled: isTeacher,
    })

  const {
    courseUnit,
    courseRealisation,
    opensAt,
    feedback,
    responsibleTeachers,
    teachers,
    feedbackResponseEmailSent,
    settingsReadByTeacher,
    feedbackCount,
    studentCount,
    continuousFeedbackEnabled,
    feedbackCanBeGiven,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isOld = feedbackTargetIsOld(feedbackTarget)

  const showFeedbacksTab =
    isAdmin ||
    ((isOrganisationAdmin || isTeacher) && isStarted) ||
    feedback ||
    isEnded
  const showContinuousFeedbackTab = continuousFeedbackEnabled
  const showEditFeedbackResponseTab =
    (isOrganisationAdmin || isResponsibleTeacher) && isEnded && !isOld
  const showStudentsWithFeedbackTab =
    isAdmin ||
    ((isOrganisationAdmin || isResponsibleTeacher) && (isOpen || isEnded))
  const showLinksTab = isOrganisationAdmin || isTeacher
  const showSettingsTab = isOrganisationAdmin || isResponsibleTeacher
  const showTogen = isAdmin
  const showLogsTab = isAdmin

  const showTags = feedbackTarget.courseRealisation?.tags?.length > 0
  const coursePeriod = getCoursePeriod(courseRealisation)
  const feedbackPeriod = getFeedbackPeriod(feedbackTarget)
  const coursePageUrl = links.getCoursePage(feedbackTarget)
  const wikiLink = links.teacherInstructions[i18n.language]
  const courseSummaryPath = getCourseUnitSummaryPath(feedbackTarget)
  const courseRealisationName = getLanguageValue(
    courseRealisation?.name,
    i18n.language,
  )
  const courseUnitName = getLanguageValue(courseUnit?.name, i18n.language)
  const visibleCourseCode =
    courseRealisationName.indexOf(courseUnit?.courseCode) > -1
      ? ''
      : `, ${courseUnit?.courseCode}`

  if (!feedbackCanBeGiven && !isTeacher) {
    return <ErrorView message={t('feedbackTargetView:feedbackDisabled')} />
  }

  const handleCopyLink = () => {
    const link = `https://${window.location.host}/targets/${id}/feedback`
    copyLink(link)
    enqueueSnackbar(`${t('feedbackTargetView:linkCopied')}: ${link}`, {
      variant: 'info',
    })
  }

  return (
    <>
      <Box mb={3}>
        {!feedbackCanBeGiven && (
          <Alert severity="error">
            {t('feedbackTargetView:feedbackDisabled')}
          </Alert>
        )}
        <div css={styles.headingContainer}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h4" component="h1">
              {courseUnitName}
              {visibleCourseCode}
            </Typography>
            <Box mt={1} />
            <Typography variant="body1" component="h2">
              {courseRealisationName}
            </Typography>
            {organisation && (
              <MuiLink
                to={`/organisations/${organisation.code}`}
                component={Link}
                underline="hover"
              >
                {getLanguageValue(organisation.name, i18n.language)}
              </MuiLink>
            )}
          </Box>
          {isTeacher && (
            <div css={styles.copyLinkButtonContainer}>
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
        <Box sx={styles.infoContainer}>
          <Box mr="auto">
            <dl css={styles.datesContainer}>
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

              {continuousFeedbackEnabled && (
                <>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                    component="dt"
                  >
                    {t('feedbackTargetView:continuousFeedbackTab')}:
                  </Typography>

                  <Typography
                    color="textSecondary"
                    variant="body2"
                    component="dd"
                  >
                    {coursePeriod}
                  </Typography>
                </>
              )}
            </dl>

            <Box sx={[styles.linkContainer, styles.hidePrint]}>
              <ExternalLink href={coursePageUrl}>
                {t('feedbackTargetView:coursePage')}
              </ExternalLink>

              {isTeacher && (
                <ExternalLink href={wikiLink}>
                  {t('footer:wikiLink')}
                </ExternalLink>
              )}

              {isTeacher && showCourseSummaryLink && (
                <MuiLink
                  to={courseSummaryPath}
                  component={Link}
                  underline="hover"
                >
                  {t('feedbackTargetView:courseSummary')}
                </MuiLink>
              )}
            </Box>
          </Box>
          {isResponsibleTeacher && (
            <Box mt="1rem" mr="3rem">
              <Typography gutterBottom>
                {t('feedbackTargetView:studentsWithFeedbackTab')}
              </Typography>
              <Box display="flex">
                <PercentageCell
                  label={`${feedbackCount}/${studentCount}`}
                  percent={(feedbackCount / studentCount) * 100}
                />
              </Box>
            </Box>
          )}
          {showTags && (
            <Box mt="1rem">
              <Typography gutterBottom>{t('common:studyTracks')}</Typography>
              <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                width="20rem"
              >
                {feedbackTarget.courseRealisation.tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} language={i18n.language} />
                ))}
              </Box>
            </Box>
          )}

          {!!responsibleTeachers.length && (
            <Box mt="1rem" ml="1rem">
              <Typography gutterBottom>
                {t('feedbackTargetView:responsibleTeachers')}
              </Typography>
              <ResponsibleTeachersList
                teachers={responsibleTeachers}
                isAdmin={isAdmin}
                onDelete={handleDeleteTeacher(feedbackTarget, t)}
              />
            </Box>
          )}

          {!!teachers.length && (
            <Box mt="1rem" ml="1rem">
              <Typography gutterBottom>
                {t('feedbackTargetView:teachers')}
              </Typography>
              <ResponsibleTeachersList
                teachers={teachers}
                isAdmin={isAdmin}
                onDelete={handleDeleteTeacher(feedbackTarget, t)}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box mb={2} sx={styles.hidePrint}>
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
          {showContinuousFeedbackTab && (
            <RouterTab
              icon={<ReviewsOutlined />}
              label={t('feedbackTargetView:continuousFeedbackTab')}
              to={`${url}/continuous-feedback`}
            />
          )}
          {showEditFeedbackResponseTab && (
            <RouterTab
              icon={<EditOutlined />}
              label={t('feedbackTargetView:editFeedbackResponseTab')}
              to={`${url}/edit-feedback-response`}
              badge={!feedbackResponseEmailSent}
            />
          )}
          {showSettingsTab && (
            <RouterTab
              icon={<EditOutlined />}
              label={t('feedbackTargetView:surveySettingsTab')}
              to={`${url}/edit`}
              badge={!settingsReadByTeacher}
            />
          )}
          {showLinksTab && (
            <RouterTab
              icon={<ShareOutlined />}
              label={t('feedbackTargetView:shareTab')}
              to={`${url}/share`}
            />
          )}
          {showStudentsWithFeedbackTab && (
            <RouterTab
              icon={<PeopleOutlined />}
              label={t('feedbackTargetView:studentsWithFeedbackTab')}
              to={`${url}/students-with-feedback`}
            />
          )}
          {showTogen && (
            <RouterTab
              icon={<ListOutlined />}
              label="Togen"
              to={`${url}/togen`}
            />
          )}
          {showLogsTab && (
            <RouterTab
              icon={<ListOutlined />}
              label="Logs"
              to={`${url}/logs`}
            />
          )}
        </RouterTabs>
      </Box>

      <Switch>
        <ProtectedRoute
          path={`${path}/edit`}
          component={FeedbackTargetSettings}
          hasAccess={showSettingsTab}
        />
        <ProtectedRoute
          path={`${path}/results`}
          component={FeedbackTargetResults}
          hasAccess={showFeedbacksTab}
        />
        <ProtectedRoute
          path={`${path}/feedback`}
          component={FeedbackView}
          hasAccess
        />
        <ProtectedRoute
          path={`${path}/continuous-feedback`}
          component={ContinuousFeedback}
          hasAccess={showContinuousFeedbackTab}
        />
        <ProtectedRoute
          path={`${path}/students-with-feedback`}
          component={StudentsWithFeedback}
          hasAccess={showStudentsWithFeedbackTab}
        />
        <ProtectedRoute
          path={`${path}/share`}
          component={FeedbackTargetShare}
          hasAccess={showLinksTab}
        />
        <ProtectedRoute
          path={`${path}/togen`}
          component={FeedbackLinksView}
          hasAccess={showTogen}
        />
        <ProtectedRoute
          path={`${path}/edit-feedback-response`}
          component={EditFeedbackResponse}
          hasAccess={showEditFeedbackResponseTab}
        />
        <ProtectedRoute
          path={`${path}/logs`}
          component={FeedbackTargetLogs}
          hasAccess={showLogsTab}
        />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default FeedbackTargetContent
