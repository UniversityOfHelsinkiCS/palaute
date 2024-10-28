import React from 'react'

import { Route, useParams, Routes, Navigate } from 'react-router-dom'

import { Box, Typography } from '@mui/material'
import {
  CalendarTodayOutlined,
  CommentOutlined,
  LiveHelpOutlined,
  PollOutlined,
  SettingsOutlined,
  DynamicFormOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import { ORGANISATION_SURVEYS_ENABLED, SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS } from '../../util/common'
import EditSurvey from './EditSurvey'
import GeneralSettings from './GeneralSettings'
import ProgrammeOpenQuestions from './ProgrammeOpenQuestions'
import OrganisationSurveys from './OrganisationSurveys'
import useOrganisation from '../../hooks/useOrganisation'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { getLanguageValue } from '../../util/languageUtils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import OrganisationLogs from './OrganisationLogs'
import SemesterOverview from './SemesterOverview'
import Title from '../../components/common/Title'
import { RouterTab, RouterTabs } from '../../components/common/RouterTabs'
import ErrorView from '../../components/common/ErrorView'
import errors from '../../util/errorMessage'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import LinkButton from '../../components/common/LinkButton'
import ForOrganisation from '../CourseSummary/ForOrganisation'

const Organisation = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { organisation, isLoading, isLoadingError, error } = useOrganisation(code, { retry: 2 })
  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isLoading) {
    return <LoadingProgress />
  }

  if (isLoadingError && !organisation) {
    return <ErrorView message={errors.getGeneralError(error)} response={error?.response} />
  }

  const hasReadAccess = Boolean(organisation?.access?.read)
  const hasWriteAccess = Boolean(organisation?.access?.write)
  const hasAdminAccess = Boolean(organisation?.access?.admin)

  if (!hasReadAccess) {
    return <Navigate to="/" />
  }

  const isAdmin = !isUserLoading && authorizedUser.isAdmin

  const name = getLanguageValue(organisation.name, i18n.language)

  return (
    <>
      <Title>{name}</Title>
      <Box mb="1rem" display="flex" flexWrap="wrap" alignItems="end" gap="1rem">
        <Typography variant="h4" component="h1">
          {name}
        </Typography>
        <Typography variant="h5" color="textSecondary">
          {organisation.code}
        </Typography>
      </Box>
      <Box mb="1rem">
        <LinkButton to={t('links:wikiOrganisationHelp')} title={t('footer:wikiLink')} external />
      </Box>
      <Box mb="2rem">
        <RouterTabs variant="scrollable" scrollButtons="auto">
          {hasAdminAccess && (
            <RouterTab label={t('organisationSettings:settingsTab')} icon={<SettingsOutlined />} to="/settings" />
          )}
          {hasWriteAccess && (
            <RouterTab label={t('organisationSettings:surveyTab')} icon={<LiveHelpOutlined />} to="/survey" />
          )}
          {ORGANISATION_SURVEYS_ENABLED && hasAdminAccess && (
            <RouterTab
              label={t('organisationSettings:organisationSurveysTab')}
              icon={<DynamicFormOutlined />}
              to="/organisation-surveys"
            />
          )}
          {SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS && (
            <RouterTab
              label={t('organisationSettings:courseRealisationsTab')}
              to="/upcoming"
              icon={<CalendarTodayOutlined />}
            />
          )}
          <RouterTab label={t('organisationSettings:summaryTab')} to="/summary" icon={<PollOutlined />} />
          {hasAdminAccess && (
            <RouterTab label={t('organisationSettings:openQuestionsTab')} to="/open" icon={<CommentOutlined />} />
          )}
          {isAdmin && <RouterTab label="Organisation Logs" to="/logs" />}
        </RouterTabs>
      </Box>
      <Routes>
        <ProtectedRoute
          path="/settings"
          hasAccess={hasAdminAccess}
          redirect="/summary"
          component={<GeneralSettings />}
        />

        <Route path="/upcoming">
          <SemesterOverview organisation={organisation} />
        </Route>

        <ProtectedRoute path="/survey" hasAccess={hasWriteAccess} redirect="/summary" component={<EditSurvey />} />

        {ORGANISATION_SURVEYS_ENABLED && (
          <ProtectedRoute
            path="/organisation-surveys"
            hasAccess={hasWriteAccess}
            redirect="/summary"
            component={<OrganisationSurveys />}
          />
        )}

        <Route path="/summary">
          <ForOrganisation organisation={organisation} />
        </Route>

        <ProtectedRoute
          path="/open"
          hasAccess={hasAdminAccess}
          redirect="/summary"
          component={<ProgrammeOpenQuestions />}
        />

        <ProtectedRoute path="/logs" hasAccess={isAdmin} redirect="/summary" component={<OrganisationLogs />} />

        <Route path="*" element={<Navigate to="/summary" />} />
      </Routes>
    </>
  )
}

export default Organisation
