import React from 'react'
/** @jsxImportSource @emotion/react */

import { Switch, useRouteMatch, useParams, Redirect } from 'react-router-dom'

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

import { ALWAYS_SHOW_STUDENT_LIST, INTERIM_FEEDBACKS_ENABLED } from '../../util/common'
import Results from './tabs/Results'
import FeedbackView from './tabs/FeedbackView'
import StudentsWithFeedback from './tabs/StudentsWithFeedback'
import EditFeedbackResponse from './tabs/EditFeedbackResponse'
import Share from './tabs/Share'
import Links from './tabs/Links'
import Settings from './tabs/Settings'
import Logs from './tabs/Logs'
import ContinuousFeedback from './tabs/ContinuousFeedback'
import InterimFeedback from './tabs/InterimFeedback'
import { RouterTab } from '../../components/common/RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'
import { getCourseCode, getPrimaryCourseName } from '../../util/courseIdentifiers'
import { feedbackTargetIsOpenOrClosed } from './Dates/utils'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import ErrorView from '../../components/common/ErrorView'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import Title from '../../components/common/Title'
import { TabGroup, TabGroupsContainer } from '../../components/common/TabGroup'
import FeedbackTargetInformation from './FeedbackTargetInformation'

const FeedbackTargetContent = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isStudent, isTeacher, isAdmin, isOrganisationAdmin, isResponsibleTeacher } =
    useFeedbackTargetContext()

  const {
    courseUnit,
    courseRealisation,
    feedback,
    feedbackResponseEmailSent,
    settingsReadByTeacher,
    continuousFeedbackCount,
    continuousFeedbackEnabled,
    feedbackCanBeGiven,
    userCreated,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)
  const isOpenOrClosed = feedbackTargetIsOpenOrClosed(feedbackTarget)

  const showResultsSection = isAdmin || isOrganisationAdmin || isTeacher || feedback || isEnded
  const showContinuousFeedbackTab =
    ((isStudent && continuousFeedbackEnabled) || isOrganisationAdmin || isResponsibleTeacher) && !userCreated
  const showEditFeedbackResponseTab = (isOrganisationAdmin || isResponsibleTeacher) && isEnded && !isOld
  const showStudentsWithFeedbackTab =
    isAdmin || ((isOrganisationAdmin || isResponsibleTeacher) && (ALWAYS_SHOW_STUDENT_LIST || isOpen || isEnded))
  const showLinksTab = isOrganisationAdmin || isTeacher
  const showSettingsTab = (isOrganisationAdmin || isResponsibleTeacher) && !isEnded
  const showInterimFeedbackTab = INTERIM_FEEDBACKS_ENABLED && isAdmin && !userCreated
  const showAdditionalSection = showContinuousFeedbackTab || showInterimFeedbackTab

  const courseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const courseCode = getCourseCode(courseUnit)
  // Show course code only if it is not already in the course name
  const visibleCourseCode = courseName.indexOf(courseCode) > -1 ? '' : courseCode
  const title = `${visibleCourseCode} ${courseName}`

  if (!feedbackCanBeGiven && !isTeacher) {
    return <ErrorView message={t('feedbackTargetView:feedbackDisabled')} />
  }

  const defaultPath = `/targets/${id}/feedback`

  return (
    <>
      <Title>{title}</Title>
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
          <TabGroup data-cy="feedback-target-feedback-tab-group" title={t('common:survey')} hideTitle={isStudent}>
            {feedback && isOpen ? (
              <RouterTab
                data-cy="feedback-target-edit-feedback-tab"
                label={t('feedbackTargetView:editFeedbackTab')}
                to={`${url}/feedback`}
                icon={<EditOutlined />}
              />
            ) : (
              <RouterTab
                data-cy="feedback-target-give-feedback-tab"
                label={isStudent ? t('feedbackTargetView:surveyTab') : t('common:preview')}
                to={`${url}/feedback`}
                badge={isOpen}
                icon={<LiveHelpOutlined />}
              />
            )}
            {showSettingsTab && (
              <RouterTab
                data-cy="feedback-target-settings-tab"
                label={t('feedbackTargetView:surveySettingsTab')}
                to={`${url}/edit`}
                disabled={!isAdmin && isOpenOrClosed}
                disabledTooltip={t('feedbackTargetView:surveyTabDisabledTooltip')}
                badge={!settingsReadByTeacher && !isOpenOrClosed}
                icon={<EditOutlined />}
              />
            )}
            {showEditFeedbackResponseTab && (
              <RouterTab
                data-cy="feedback-target-feedback-response-tab"
                label={
                  !feedbackResponseEmailSent
                    ? t('feedbackTargetView:giveFeedbackResponseTab')
                    : t('feedbackTargetView:editFeedbackResponseTab')
                }
                to={`${url}/edit-feedback-response`}
                badge={!feedbackResponseEmailSent}
                icon={<EditOutlined />}
              />
            )}
            {showLinksTab && (
              <RouterTab
                data-cy="feedback-target-share-feedback-tab"
                label={t('feedbackTargetView:shareTab')}
                to={`${url}/share`}
                icon={<ShareOutlined />}
              />
            )}
          </TabGroup>

          {showAdditionalSection && (
            <TabGroup
              data-cy="feedback-target-additional-tab-group"
              title={t('common:additional')}
              hideTitle={isStudent}
            >
              {showContinuousFeedbackTab && (
                <RouterTab
                  data-cy="feedback-target-continuous-feedback-tab"
                  label={t('feedbackTargetView:continuousFeedbackTab')}
                  to={`${url}/continuous-feedback`}
                  badge={continuousFeedbackCount}
                  badgeContent={continuousFeedbackCount}
                  badgeVisible={!isStudent}
                  badgeColor="grey"
                  icon={<ReviewsOutlined />}
                />
              )}
              {showInterimFeedbackTab && (
                <RouterTab
                  data-cy="feedback-target-interim-feedback-tab"
                  label={t('feedbackTargetView:interimFeedbackTab')}
                  to={`${url}/interim-feedback`}
                  icon={<ForumOutlined />}
                />
              )}
            </TabGroup>
          )}

          {showResultsSection && (
            <TabGroup
              data-cy="feedback-target-result-tab-group"
              title={t('feedbackTargetView:results')}
              hideTitle={isStudent}
            >
              <RouterTab
                data-cy="feedback-target-results-tab"
                label={t('feedbackTargetView:feedbacksTab')}
                to={`${url}/results`}
                icon={<PollOutlined />}
              />
              {showStudentsWithFeedbackTab && (
                <RouterTab
                  data-cy="feedback-target-students-with-feedback-tab"
                  label={t('feedbackTargetView:studentsWithFeedbackTab')}
                  to={`${url}/students-with-feedback`}
                  icon={<PeopleOutlined />}
                />
              )}
            </TabGroup>
          )}

          {isAdmin && (
            <TabGroup data-cy="feedback-target-admin-tab-group" title="Admin">
              <RouterTab
                data-cy="feedback-target-togen-tab"
                label="Togen"
                to={`${url}/togen`}
                icon={<ListOutlined />}
              />
              <RouterTab data-cy="feedback-target-logs-tab" label="Logs" to={`${url}/logs`} icon={<ListOutlined />} />
            </TabGroup>
          )}
        </TabGroupsContainer>
      </Box>

      <Switch>
        <ProtectedRoute
          path={`${path}/edit`}
          component={Settings}
          hasAccess={showSettingsTab}
          redirectPath={defaultPath}
        />
        <ProtectedRoute
          path={`${path}/results`}
          component={Results}
          hasAccess={showResultsSection}
          redirectPath={defaultPath}
        />
        <ProtectedRoute path={`${path}/feedback`} component={FeedbackView} hasAccess />
        <ProtectedRoute
          path={`${path}/continuous-feedback`}
          component={ContinuousFeedback}
          hasAccess={showContinuousFeedbackTab}
          redirectPath={defaultPath}
        />
        <ProtectedRoute
          path={`${path}/interim-feedback`}
          component={InterimFeedback}
          hasAccess={showInterimFeedbackTab}
          redirectPath={defaultPath}
        />
        <ProtectedRoute
          path={`${path}/students-with-feedback`}
          component={StudentsWithFeedback}
          hasAccess={showStudentsWithFeedbackTab}
          redirectPath={defaultPath}
        />
        <ProtectedRoute path={`${path}/share`} component={Share} hasAccess={showLinksTab} redirectPath={defaultPath} />
        <ProtectedRoute path={`${path}/togen`} component={Links} hasAccess={isAdmin} redirectPath={defaultPath} />
        <ProtectedRoute
          path={`${path}/edit-feedback-response`}
          redirectPath={defaultPath}
          component={EditFeedbackResponse}
          hasAccess={showEditFeedbackResponseTab}
        />
        <ProtectedRoute path={`${path}/logs`} component={Logs} hasAccess={isAdmin} redirectPath={defaultPath} />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default FeedbackTargetContent
