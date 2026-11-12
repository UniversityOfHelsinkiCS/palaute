import {
  AdminPanelSettingsOutlined,
  AssignmentOutlined,
  EditOutlined,
  ListOutlined,
  LiveHelpOutlined,
  PeopleOutlined,
  PollOutlined,
  ReplyOutlined,
  ShareOutlined,
  ReviewsOutlined,
  ForumOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
/** @jsxImportSource @emotion/react */
import { Alert, Box, Card, CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, Route, Routes, useMatch } from 'react-router-dom'

import ErrorView from '../../components/common/ErrorView'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import Title from '../../components/common/Title'
import {
  ALWAYS_SHOW_STUDENT_LIST,
  INTERIM_FEEDBACKS_ENABLED,
  SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING,
} from '../../util/common'
import { getCourseCode, getPrimaryCourseName, getSurveyType } from '../../util/courseIdentifiers'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { getLanguageValue } from '../../util/languageUtils'
import { feedbackTargetIsOpenOrClosed } from './Dates/utils'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import FeedbackTargetInformation from './FeedbackTargetInformation'
import {
  FeedbackTargetTabsContainer,
  FeedbackTargetInnerTabsContainer,
  FeedbackTargetTab,
  FeedbackTargetTabDivider,
} from './FeedbackTargetTabs'
import ContinuousFeedback from './tabs/ContinuousFeedback'
import EditFeedbackResponse from './tabs/EditFeedbackResponse'
import FeedbackView from './tabs/FeedbackView'
import { formatDate } from './tabs/FeedbackView/utils'
// eslint-disable-next-line import/no-cycle
import InterimFeedback from './tabs/InterimFeedback'
import Links from './tabs/Links'
import Logs from './tabs/Logs'
import Results from './tabs/Results'
import Settings from './tabs/Settings'
import Share from './tabs/Share'
import StudentsWithFeedback from './tabs/StudentsWithFeedback'
const generateTabpanelId = tabId => tabId.replace('-tab-', '-tabpanel-')

const TabCard = ({ tabId, children }) => (
  <Card role="tabpanel" id={generateTabpanelId(tabId)} aria-labelledby={tabId} sx={{ overflow: 'visible' }}>
    {children}
  </Card>
)

const TabGroup = ({ groupTabId, tabs }) => (
  <TabCard tabId={groupTabId}>
    <CardContent sx={{ pt: 1 }}>
      <FeedbackTargetInnerTabsContainer aria-labelledby={groupTabId}>{tabs}</FeedbackTargetInnerTabsContainer>
      {/* Lines up the panel content with the first inner tab's icon, and keeps it further from the card's edges */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Outlet />
      </Box>
    </CardContent>
  </TabCard>
)

const TabHeading = ({ children }) => (
  <Typography component="h3" variant="h6" sx={{ mb: 3 }}>
    {children}
  </Typography>
)

const TopLevelTabPanel = ({ tabId, heading, children }) => (
  <TabCard tabId={tabId}>
    <CardContent>
      <Box sx={{ p: 2 }}>
        <TabHeading>{heading}</TabHeading>
        {children}
      </Box>
    </CardContent>
  </TabCard>
)

const TabPanel = ({ tabId, groupName, heading, children }) => (
  <Box role="tabpanel" id={generateTabpanelId(tabId)} aria-labelledby={tabId}>
    <TabHeading>{`${groupName} – ${heading}`}</TabHeading>
    {children}
  </Box>
)

const FeedbackTargetContent = () => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isStudent, isTeacher, isAdmin, isOrganisationAdmin, isResponsibleTeacher } =
    useFeedbackTargetContext()

  const {
    courseUnit,
    courseRealisation,
    feedback,
    continuousFeedbackEnabled,
    feedbackCanBeGiven,
    userCreated,
    closesAt,
  } = feedbackTarget
  const fbtMatch = useMatch('/targets/:feedbackTargetId/*')
  const interimMatch = useMatch('/targets/:feedbackTargetId/interim-feedback/:interimFeedbackId/*')
  const pathnameBase = interimMatch?.pathnameBase || fbtMatch?.pathnameBase // This has to be done because of recursivity of interim feedbacks

  const feedbackGiven = !!feedback

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOngoing = !isOpen && !isEnded
  const defaultPath = `${pathnameBase}/feedback`
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isOpenOrClosed = feedbackTargetIsOpenOrClosed(feedbackTarget)

  const { isInterimFeedback } = getSurveyType(courseUnit, feedbackTarget)
  const courseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )

  // Show course code only if it is not already in the course name
  const visibleCourseCode = courseName.indexOf(courseCode) > -1 ? '' : courseCode
  const showResultsSection =
    isAdmin ||
    isOrganisationAdmin ||
    isTeacher ||
    isEnded ||
    (!SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING && feedbackGiven)
  const showContinuousFeedbackTab =
    ((isStudent && continuousFeedbackEnabled) || isOrganisationAdmin || isResponsibleTeacher) && !userCreated
  const showSurveyTabGroup = !isStudent || isTeacher || isOrganisationAdmin
  const hideSurveyTab = !showSurveyTabGroup && isOngoing && continuousFeedbackEnabled
  const showEditFeedbackResponseTab = (isOrganisationAdmin || isResponsibleTeacher) && !isOld
  const showStudentsWithFeedbackTab =
    isAdmin || ((isOrganisationAdmin || isResponsibleTeacher) && (ALWAYS_SHOW_STUDENT_LIST || isOpen || isEnded))
  const showLinksTab = isOrganisationAdmin || isTeacher
  const canEditQuestions = (isOrganisationAdmin || isResponsibleTeacher) && !isEnded && (isAdmin || !isOpenOrClosed)
  const showInterimFeedbackTab =
    INTERIM_FEEDBACKS_ENABLED && (isAdmin || isOrganisationAdmin || isResponsibleTeacher) && !userCreated
  const showDividerBeforeContinuousFeedbackTab =
    showContinuousFeedbackTab && (!hideSurveyTab || showResultsSection || showEditFeedbackResponseTab)

  const getQuestionsUneditableInfo = () => {
    if (!showSurveyTabGroup || canEditQuestions) return undefined

    if (!isOrganisationAdmin && !isResponsibleTeacher) {
      return t('feedbackTargetView:questionsEditableByResponsibleTeachersInfo')
    }

    return t('feedbackTargetView:questionsNotEditableAfterOpeningInfo')
  }

  // This is necessary to identify which is related to interim feedback modal and which is related to the original fbt
  const dataCyPrefix = isInterimFeedback ? 'interim-' : ''
  const generateTabId = id => `${dataCyPrefix}feedback-target-tab-${id}`

  const surveyGroupTabId = generateTabId('survey')
  const adminTabId = generateTabId('admin')
  const surveyGroupName = t('feedbackTargetView:surveyTab')
  const adminGroupName = 'Admin'

  const getSurveyTabLabel = () => {
    if (feedbackGiven && isOpen) return t('feedbackTargetView:editFeedbackTab')

    if (isStudent) return t('feedbackTargetView:surveyTab')

    return t('common:preview')
  }

  const surveyTab =
    !hideSurveyTab &&
    (feedbackGiven && isOpen ? (
      <FeedbackTargetTab
        key="feedback"
        data-cy={`${dataCyPrefix}feedback-target-edit-feedback-tab`}
        label={getSurveyTabLabel()}
        tooltip={getQuestionsUneditableInfo()}
        to={`${pathnameBase}/feedback`}
        icon={<EditOutlined />}
        id={generateTabId('feedback')}
      />
    ) : (
      <FeedbackTargetTab
        key="feedback"
        data-cy={`${dataCyPrefix}feedback-target-give-feedback-tab`}
        label={getSurveyTabLabel()}
        tooltip={getQuestionsUneditableInfo()}
        to={`${pathnameBase}/feedback`}
        icon={isStudent ? <LiveHelpOutlined /> : <VisibilityOutlined />}
        id={generateTabId('feedback')}
      />
    ))

  const surveyGroupTabs = [
    surveyTab,
    canEditQuestions && (
      <FeedbackTargetTab
        key="edit"
        data-cy={`${dataCyPrefix}feedback-target-settings-tab`}
        label={t('feedbackTargetView:surveyQuestionsTab')}
        to={`${pathnameBase}/edit`}
        icon={<EditOutlined />}
        id={generateTabId('edit')}
      />
    ),
    showLinksTab && (
      <FeedbackTargetTab
        key="share"
        data-cy={`${dataCyPrefix}feedback-target-share-feedback-tab`}
        label={t('feedbackTargetView:shareTab')}
        to={`${pathnameBase}/share`}
        icon={<ShareOutlined />}
        id={generateTabId('share')}
      />
    ),
    showResultsSection && showStudentsWithFeedbackTab && (
      <FeedbackTargetTab
        key="students-with-feedback"
        data-cy={`${dataCyPrefix}feedback-target-students-with-feedback-tab`}
        label={t('feedbackTargetView:studentsWithFeedbackTab')}
        to={`${pathnameBase}/students-with-feedback`}
        icon={<PeopleOutlined />}
        id={generateTabId('students-with-feedback')}
      />
    ),
  ]

  const adminTabs = [
    <FeedbackTargetTab
      key="togen"
      data-cy={`${dataCyPrefix}feedback-target-togen-tab`}
      label="Togen"
      to={`${pathnameBase}/togen`}
      icon={<ListOutlined />}
      id={generateTabId('togen')}
    />,
    <FeedbackTargetTab
      key="logs"
      data-cy={`${dataCyPrefix}feedback-target-logs-tab`}
      label="Logs"
      to={`${pathnameBase}/logs`}
      icon={<ListOutlined />}
      id={generateTabId('logs')}
    />,
  ]

  if (!feedbackCanBeGiven && !isTeacher) {
    return (
      <ErrorView
        message={t('feedbackTargetView:feedbackDisabled')}
        response={{ status: 423, message: t('feedbackTargetView:feedbackDisabled') }}
      />
    )
  }

  return (
    <>
      <Title>{`${visibleCourseCode} ${courseName}`}</Title>
      {!feedbackCanBeGiven && <Alert severity="error">{t('feedbackTargetView:feedbackDisabled')}</Alert>}
      <FeedbackTargetInformation />

      <FeedbackTargetTabsContainer aria-label={t('feedbackTargetView:tabListLabel')}>
        {showSurveyTabGroup ? (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-survey-tab`}
            label={surveyGroupName}
            to={`${pathnameBase}/feedback`}
            matchPaths={['feedback', 'edit', 'share', 'students-with-feedback'].map(path => `${pathnameBase}/${path}`)}
            icon={<AssignmentOutlined />}
            id={surveyGroupTabId}
          />
        ) : (
          surveyTab
        )}
        {showResultsSection && (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-results-tab`}
            label={t('feedbackTargetView:feedbacksTab')}
            to={`${pathnameBase}/results`}
            icon={<PollOutlined />}
            id={generateTabId('results')}
          />
        )}
        {showEditFeedbackResponseTab && (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-feedback-response-tab`}
            label={t('feedbackTargetView:feedbackResponseTab')}
            tooltip={
              !isEnded
                ? t('feedbackTargetView:feedbackResponseTabTooltip', { closesAt: formatDate(new Date(closesAt)) })
                : undefined
            }
            to={`${pathnameBase}/edit-feedback-response`}
            icon={<ReplyOutlined />}
            id={generateTabId('edit-feedback-response')}
          />
        )}
        {showDividerBeforeContinuousFeedbackTab && <FeedbackTargetTabDivider />}
        {showContinuousFeedbackTab && (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-continuous-feedback-tab`}
            label={t('feedbackTargetView:continuousFeedbackTab')}
            to={`${pathnameBase}/continuous-feedback`}
            icon={<ReviewsOutlined />}
            id={generateTabId('continuous-feedback')}
          />
        )}
        {showInterimFeedbackTab && (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-interim-feedback-tab`}
            label={t('feedbackTargetView:interimFeedbackTab')}
            to={`${pathnameBase}/interim-feedback`}
            icon={<ForumOutlined />}
            id={generateTabId('interim-feedback')}
          />
        )}
        {isAdmin && <FeedbackTargetTabDivider />}
        {isAdmin && (
          <FeedbackTargetTab
            data-cy={`${dataCyPrefix}feedback-target-admin-tab`}
            label={adminGroupName}
            to={`${pathnameBase}/togen`}
            matchPaths={['togen', 'logs'].map(path => `${pathnameBase}/${path}`)}
            icon={<AdminPanelSettingsOutlined />}
            id={adminTabId}
          />
        )}
      </FeedbackTargetTabsContainer>

      <Routes>
        <Route
          element={showSurveyTabGroup ? <TabGroup groupTabId={surveyGroupTabId} tabs={surveyGroupTabs} /> : <Outlet />}
        >
          <Route
            path="/feedback"
            element={
              showSurveyTabGroup ? (
                <TabPanel tabId={generateTabId('feedback')} groupName={surveyGroupName} heading={getSurveyTabLabel()}>
                  <ProtectedRoute hasAccess>
                    <FeedbackView questionsUneditableInfo={getQuestionsUneditableInfo()} />
                  </ProtectedRoute>
                </TabPanel>
              ) : (
                <TopLevelTabPanel tabId={generateTabId('feedback')} heading={getSurveyTabLabel()}>
                  <ProtectedRoute hasAccess>
                    <FeedbackView />
                  </ProtectedRoute>
                </TopLevelTabPanel>
              )
            }
          />

          <Route
            path="/edit"
            element={
              <TabPanel
                tabId={generateTabId('edit')}
                groupName={surveyGroupName}
                heading={t('feedbackTargetView:surveyQuestionsTab')}
              >
                <ProtectedRoute hasAccess={canEditQuestions} redirectPath={defaultPath}>
                  <Settings />
                </ProtectedRoute>
              </TabPanel>
            }
          />

          <Route
            path="/share"
            element={
              <TabPanel
                tabId={generateTabId('share')}
                groupName={surveyGroupName}
                heading={t('feedbackTargetView:shareTab')}
              >
                <ProtectedRoute hasAccess={showLinksTab} redirectPath={defaultPath}>
                  <Share />
                </ProtectedRoute>
              </TabPanel>
            }
          />

          <Route
            path="/students-with-feedback"
            element={
              <TabPanel
                tabId={generateTabId('students-with-feedback')}
                groupName={surveyGroupName}
                heading={t('feedbackTargetView:studentsWithFeedbackTab')}
              >
                <ProtectedRoute hasAccess={showStudentsWithFeedbackTab} redirectPath={defaultPath}>
                  <StudentsWithFeedback />
                </ProtectedRoute>
              </TabPanel>
            }
          />
        </Route>

        <Route element={isAdmin ? <TabGroup groupTabId={adminTabId} tabs={adminTabs} /> : <Outlet />}>
          <Route
            path="/togen"
            element={
              <TabPanel tabId={generateTabId('togen')} groupName={adminGroupName} heading="Togen">
                <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
                  <Links />
                </ProtectedRoute>
              </TabPanel>
            }
          />

          <Route
            path="/logs"
            element={
              <TabPanel tabId={generateTabId('logs')} groupName={adminGroupName} heading="Logs">
                <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
                  <Logs />
                </ProtectedRoute>
              </TabPanel>
            }
          />
        </Route>

        <Route
          path="/results"
          element={
            <TopLevelTabPanel tabId={generateTabId('results')} heading={t('feedbackTargetView:feedbacksTab')}>
              <ProtectedRoute hasAccess={showResultsSection} redirectPath={defaultPath}>
                <Results />
              </ProtectedRoute>
            </TopLevelTabPanel>
          }
        />

        <Route
          path="/continuous-feedback"
          element={
            <TopLevelTabPanel
              tabId={generateTabId('continuous-feedback')}
              heading={t('feedbackTargetView:continuousFeedbackTab')}
            >
              <ProtectedRoute hasAccess={showContinuousFeedbackTab} redirectPath={defaultPath}>
                <ContinuousFeedback />
              </ProtectedRoute>
            </TopLevelTabPanel>
          }
        />

        <Route
          path="/interim-feedback/*"
          element={
            <TopLevelTabPanel
              tabId={generateTabId('interim-feedback')}
              heading={t('feedbackTargetView:interimFeedbackTab')}
            >
              <ProtectedRoute hasAccess={showInterimFeedbackTab} redirectPath={defaultPath}>
                <InterimFeedback />
              </ProtectedRoute>
            </TopLevelTabPanel>
          }
        />

        <Route
          path="/edit-feedback-response"
          element={
            <TopLevelTabPanel
              tabId={generateTabId('edit-feedback-response')}
              heading={t('feedbackTargetView:feedbackResponseTab')}
            >
              <ProtectedRoute hasAccess={showEditFeedbackResponseTab} redirectPath={defaultPath}>
                <EditFeedbackResponse />
              </ProtectedRoute>
            </TopLevelTabPanel>
          }
        />

        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </>
  )
}

export default FeedbackTargetContent
