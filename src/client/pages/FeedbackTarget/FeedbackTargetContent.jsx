import React from 'react'
/** @jsxImportSource @emotion/react */

import { Navigate, Route, Routes, useMatch } from 'react-router-dom'

import { Alert, Box } from '@mui/material'

import { useTranslation } from 'react-i18next'
import {
  EditOutlined,
  ListOutlined,
  LiveHelpOutlined,
  PeopleOutlined,
  PollOutlined,
  ShareOutlined,
  ReviewsOutlined,
  ForumOutlined,
} from '@mui/icons-material'

import {
  ALWAYS_SHOW_STUDENT_LIST,
  INTERIM_FEEDBACKS_ENABLED,
  SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING,
} from '../../util/common'
import Results from './tabs/Results'
import FeedbackView from './tabs/FeedbackView'
import StudentsWithFeedback from './tabs/StudentsWithFeedback'
import EditFeedbackResponse from './tabs/EditFeedbackResponse'
import Share from './tabs/Share'
import Links from './tabs/Links'
import Settings from './tabs/Settings'
import Logs from './tabs/Logs'
import ContinuousFeedback from './tabs/ContinuousFeedback'
// eslint-disable-next-line import/no-cycle
import InterimFeedback from './tabs/InterimFeedback'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { getCourseCode, getPrimaryCourseName, getSurveyType } from '../../util/courseIdentifiers'
import { feedbackTargetIsOpenOrClosed } from './Dates/utils'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import ErrorView from '../../components/common/ErrorView'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import Title from '../../components/common/Title'
import { TabGroup, TabGroupsContainer, TabGroupTab } from '../../components/common/TabGroup'
import FeedbackTargetInformation from './FeedbackTargetInformation'
import useFeedbackTargetContinuousFeedbacks from '../../hooks/useFeedbackTargetContinuousFeedbacks'

const FeedbackTargetContent = () => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isStudent, isTeacher, isAdmin, isOrganisationAdmin, isResponsibleTeacher } =
    useFeedbackTargetContext()
  const { continuousFeedbacks } = useFeedbackTargetContinuousFeedbacks(feedbackTarget.id)

  const {
    courseUnit,
    courseRealisation,
    feedback,
    feedbackResponseEmailSent,
    settingsReadByTeacher,
    continuousFeedbackEnabled,
    feedbackCanBeGiven,
    userCreated,
  } = feedbackTarget

  const fbtMatch = useMatch('/targets/:feedbackTargetId/*')
  const interimMatch = useMatch('/targets/:feedbackTargetId/interim-feedback/:interimFeedbackId/*')
  const pathnameBase = interimMatch?.pathnameBase || fbtMatch?.pathnameBase // This has to be done because of recursivity of interim feedbacks
  const defaultPath = `${pathnameBase}/feedback`

  const feedbackGiven = !!feedback

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
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
  const showEditFeedbackResponseTab = (isOrganisationAdmin || isResponsibleTeacher) && isEnded && !isOld
  const showStudentsWithFeedbackTab =
    isAdmin || ((isOrganisationAdmin || isResponsibleTeacher) && (ALWAYS_SHOW_STUDENT_LIST || isOpen || isEnded))
  const showLinksTab = isOrganisationAdmin || isTeacher
  const showSettingsTab = (isOrganisationAdmin || isResponsibleTeacher) && !isEnded
  const showInterimFeedbackTab =
    INTERIM_FEEDBACKS_ENABLED && (isAdmin || isOrganisationAdmin || isResponsibleTeacher) && !userCreated

  // This is necessary to identify which is related to interim feedback modal and which is related to the original fbt
  const dataCyPrefix = isInterimFeedback ? 'interim-' : ''

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

      <Box
        mb="2rem"
        sx={{
          '@media print': {
            display: 'none',
          },
        }}
      >
        <TabGroupsContainer>
          <TabGroup
            data-cy={`${dataCyPrefix}feedback-target-feedback-tab-group`}
            title={t('common:survey')}
            hideTitle={isStudent}
          >
            {feedbackGiven && isOpen ? (
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-edit-feedback-tab`}
                label={t('feedbackTargetView:editFeedbackTab')}
                to={`${pathnameBase}/feedback`}
                icon={<EditOutlined />}
              />
            ) : (
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-give-feedback-tab`}
                label={isStudent ? t('feedbackTargetView:surveyTab') : t('common:preview')}
                to={`${pathnameBase}/feedback`}
                badge={isOpen}
                icon={<LiveHelpOutlined />}
              />
            )}
            {showSettingsTab && (
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-settings-tab`}
                label={t('feedbackTargetView:surveySettingsTab')}
                to={`${pathnameBase}/edit`}
                disabled={!isAdmin && isOpenOrClosed}
                disabledTooltip={t('feedbackTargetView:surveyTabDisabledTooltip')}
                badge={!settingsReadByTeacher && !isOpenOrClosed}
                icon={<EditOutlined />}
              />
            )}
            {showEditFeedbackResponseTab && (
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-feedback-response-tab`}
                label={
                  !feedbackResponseEmailSent
                    ? t('feedbackTargetView:giveFeedbackResponseTab')
                    : t('feedbackTargetView:editFeedbackResponseTab')
                }
                to={`${pathnameBase}/edit-feedback-response`}
                badge={!feedbackResponseEmailSent}
                icon={<EditOutlined />}
              />
            )}
            {showLinksTab && (
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-share-feedback-tab`}
                label={t('feedbackTargetView:shareTab')}
                to={`${pathnameBase}/share`}
                icon={<ShareOutlined />}
              />
            )}
          </TabGroup>

          {(showContinuousFeedbackTab || showInterimFeedbackTab) && (
            <TabGroup
              data-cy={`${dataCyPrefix}feedback-target-additional-tab-group`}
              title={t('common:additional')}
              hideTitle={isStudent}
            >
              {showContinuousFeedbackTab && (
                <TabGroupTab
                  data-cy={`${dataCyPrefix}feedback-target-continuous-feedback-tab`}
                  label={t('feedbackTargetView:continuousFeedbackTab')}
                  to={`${pathnameBase}/continuous-feedback`}
                  badge={continuousFeedbacks?.length}
                  badgeContent={continuousFeedbacks?.length}
                  badgeVisible={!isStudent}
                  badgeColor="grey"
                  icon={<ReviewsOutlined />}
                />
              )}
              {showInterimFeedbackTab && (
                <TabGroupTab
                  data-cy={`${dataCyPrefix}feedback-target-interim-feedback-tab`}
                  label={t('feedbackTargetView:interimFeedbackTab')}
                  to={`${pathnameBase}/interim-feedback`}
                  icon={<ForumOutlined />}
                />
              )}
            </TabGroup>
          )}

          {showResultsSection && (
            <TabGroup
              data-cy={`${dataCyPrefix}feedback-target-result-tab-group`}
              title={t('feedbackTargetView:results')}
              hideTitle={isStudent}
            >
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-results-tab`}
                label={t('feedbackTargetView:feedbacksTab')}
                to={`${pathnameBase}/results`}
                icon={<PollOutlined />}
              />
              {showStudentsWithFeedbackTab && (
                <TabGroupTab
                  data-cy={`${dataCyPrefix}feedback-target-students-with-feedback-tab`}
                  label={t('feedbackTargetView:studentsWithFeedbackTab')}
                  to={`${pathnameBase}/students-with-feedback`}
                  icon={<PeopleOutlined />}
                />
              )}
            </TabGroup>
          )}

          {isAdmin && (
            <TabGroup data-cy={`${dataCyPrefix}feedback-target-admin-tab-group`} title="Admin">
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-togen-tab`}
                label="Togen"
                to={`${pathnameBase}/togen`}
                icon={<ListOutlined />}
              />
              <TabGroupTab
                data-cy={`${dataCyPrefix}feedback-target-logs-tab`}
                label="Logs"
                to={`${pathnameBase}/logs`}
                icon={<ListOutlined />}
              />
            </TabGroup>
          )}
        </TabGroupsContainer>
      </Box>

      <Routes>
        <Route
          path="/edit"
          element={
            <ProtectedRoute hasAccess={showSettingsTab} redirectPath={defaultPath}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute hasAccess={showResultsSection} redirectPath={defaultPath}>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute hasAccess>
              <FeedbackView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/continuous-feedback"
          element={
            <ProtectedRoute hasAccess={showContinuousFeedbackTab} redirectPath={defaultPath}>
              <ContinuousFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interim-feedback/*"
          element={
            <ProtectedRoute hasAccess={showInterimFeedbackTab} redirectPath={defaultPath}>
              <InterimFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students-with-feedback"
          element={
            <ProtectedRoute hasAccess={showStudentsWithFeedbackTab} redirectPath={defaultPath}>
              <StudentsWithFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/share"
          element={
            <ProtectedRoute hasAccess={showLinksTab} redirectPath={defaultPath}>
              <Share />
            </ProtectedRoute>
          }
        />

        <Route
          path="/togen"
          element={
            <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
              <Links />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-feedback-response"
          element={
            <ProtectedRoute hasAccess={showEditFeedbackResponseTab} redirectPath={defaultPath}>
              <EditFeedbackResponse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </>
  )
}

export default FeedbackTargetContent
