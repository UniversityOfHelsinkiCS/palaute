import React from 'react'

import { Route, useParams, Routes, Navigate, useMatch } from 'react-router-dom'

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
  const { pathnameBase } = useMatch('/organisations/:code/*')
  const defaultPath = `${pathnameBase}/summary`

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
          <RouterTab
            label={t('organisationSettings:summaryTab')}
            to={`${pathnameBase}/summary`}
            icon={<PollOutlined />}
          />
          {hasAdminAccess && (
            <RouterTab
              label={t('organisationSettings:openQuestionsTab')}
              to={`${pathnameBase}/open`}
              icon={<CommentOutlined />}
            />
          )}
          {SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS && (
            <RouterTab
              label={t('organisationSettings:courseRealisationsTab')}
              to={`${pathnameBase}/upcoming`}
              icon={<CalendarTodayOutlined />}
            />
          )}
          {ORGANISATION_SURVEYS_ENABLED && hasWriteAccess && (
            <RouterTab
              label={t('organisationSettings:organisationSurveysTab')}
              icon={<DynamicFormOutlined />}
              to={`${pathnameBase}/organisation-surveys`}
            />
          )}
          {hasAdminAccess && (
            <RouterTab
              label={t('organisationSettings:settingsTab')}
              icon={<SettingsOutlined />}
              to={`${pathnameBase}/settings`}
            />
          )}
          {hasWriteAccess && (
            <RouterTab
              label={t('organisationSettings:surveyTab')}
              icon={<LiveHelpOutlined />}
              to={`${pathnameBase}/survey`}
            />
          )}
          {isAdmin && <RouterTab label="Organisation Logs" to={`${pathnameBase}/logs`} />}
        </RouterTabs>
      </Box>
      <Routes>
        <Route
          path="/settings"
          element={
            <ProtectedRoute hasAccess={hasAdminAccess} redirectPath={defaultPath}>
              <GeneralSettings />
            </ProtectedRoute>
          }
        />

        <Route path="/upcoming" element={<SemesterOverview organisation={organisation} />} />

        <Route
          path="/survey"
          element={
            <ProtectedRoute hasAccess={hasWriteAccess} redirectPath={defaultPath}>
              <EditSurvey />
            </ProtectedRoute>
          }
        />

        {ORGANISATION_SURVEYS_ENABLED && (
          <Route
            path="/organisation-surveys"
            element={
              <ProtectedRoute hasAccess={hasWriteAccess} redirectPath={defaultPath}>
                <OrganisationSurveys />
              </ProtectedRoute>
            }
          />
        )}

        <Route path="/summary" element={<ForOrganisation organisation={organisation} />} />

        <Route
          path="/open"
          element={
            <ProtectedRoute hasAccess={hasAdminAccess} redirectPath={defaultPath}>
              <ProgrammeOpenQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
              <OrganisationLogs />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </>
  )
}

export default Organisation
