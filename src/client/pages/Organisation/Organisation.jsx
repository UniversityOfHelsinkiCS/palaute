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
  PeopleOutlined,
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
import Responsibles from './Responsibles'
import ResponsiblesXlsx from './ResponsiblesXlsx'
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

  // organisation?.access?.* is boolean | undefined; ProtectedRoute's hasAccess prop requires a
  // strict boolean, so these conversions matter even though today's usage is purely truthy checks
  /* eslint-disable typescript/no-unnecessary-type-conversion */
  const hasReadAccess = Boolean(organisation?.access?.read)
  const hasWriteAccess = Boolean(organisation?.access?.write)
  const hasAdminAccess = Boolean(organisation?.access?.admin)

  const isFaculty = Boolean(organisation?.isFaculty)
  /* eslint-enable typescript/no-unnecessary-type-conversion */

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
          {name} ({organisation.code})
        </Typography>
      </Box>
      <Box mb="1rem">
        <LinkButton to={t('links:wikiOrganisationHelp')} title={t('footer:wikiLink')} external />
      </Box>
      <Box mb="2rem">
        <RouterTabs variant="scrollable" scrollButtons="auto">
          {hasAdminAccess && (
            <RouterTab
              label={t('organisationSettings:settingsTab')}
              icon={<SettingsOutlined />}
              to={`${pathnameBase}/settings`}
              tabId="settings"
            />
          )}
          <RouterTab
            label={t('organisationSettings:summaryTab')}
            to={`${pathnameBase}/summary`}
            icon={<PollOutlined />}
            tabId="summary"
          />
          {hasAdminAccess && (
            <RouterTab
              label={t('organisationSettings:openQuestionsTab')}
              to={`${pathnameBase}/open`}
              icon={<CommentOutlined />}
              tabId="open"
            />
          )}
          {SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS && (
            <RouterTab
              label={t('organisationSettings:courseRealisationsTab')}
              to={`${pathnameBase}/upcoming`}
              icon={<CalendarTodayOutlined />}
              tabId="upcoming"
            />
          )}
          {hasWriteAccess && (
            <RouterTab
              label={t(isFaculty ? 'organisationSettings:surveyFacultyTab' : 'organisationSettings:surveyTab')}
              icon={<LiveHelpOutlined />}
              to={`${pathnameBase}/survey`}
              tabId="survey"
            />
          )}
          {ORGANISATION_SURVEYS_ENABLED && hasWriteAccess && (
            <RouterTab
              label={t(
                isFaculty
                  ? 'organisationSettings:organisationFacultySurveysTab'
                  : 'organisationSettings:organisationSurveysTab'
              )}
              icon={<DynamicFormOutlined />}
              to={`${pathnameBase}/organisation-surveys`}
              tabId="organisation-surveys"
            />
          )}
          {SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS && (
            <RouterTab
              label={t('organisationSettings:responsiblesTab')}
              to={`${pathnameBase}/responsibles`}
              icon={<PeopleOutlined />}
              tabId="responsibles"
            />
          )}
          {isAdmin && <RouterTab label="Organisation Logs" to={`${pathnameBase}/logs`} tabId="logs" />}
        </RouterTabs>
      </Box>
      <Routes>
        <Route
          path="/settings"
          element={
            <Box role="tabpanel" id="tabpanel-settings" aria-labelledby="tab-settings">
              <ProtectedRoute hasAccess={hasAdminAccess} redirectPath={defaultPath}>
                <GeneralSettings />
              </ProtectedRoute>
            </Box>
          }
        />

        <Route
          path="/summary"
          element={
            <Box role="tabpanel" id="tabpanel-summary" aria-labelledby="tab-summary">
              <ForOrganisation organisation={organisation} />
            </Box>
          }
        />

        <Route
          path="/open"
          element={
            <Box role="tabpanel" id="tabpanel-open" aria-labelledby="tab-open">
              <ProtectedRoute hasAccess={hasAdminAccess} redirectPath={defaultPath}>
                <ProgrammeOpenQuestions />
              </ProtectedRoute>
            </Box>
          }
        />

        <Route
          path="/upcoming"
          element={
            <Box role="tabpanel" id="tabpanel-upcoming" aria-labelledby="tab-upcoming">
              <SemesterOverview organisation={organisation} />
            </Box>
          }
        />

        <Route
          path="/survey"
          element={
            <Box role="tabpanel" id="tabpanel-survey" aria-labelledby="tab-survey">
              <ProtectedRoute hasAccess={hasWriteAccess} redirectPath={defaultPath}>
                <EditSurvey />
              </ProtectedRoute>
            </Box>
          }
        />

        {ORGANISATION_SURVEYS_ENABLED && (
          <Route
            path="/organisation-surveys"
            element={
              <Box role="tabpanel" id="tabpanel-organisation-surveys" aria-labelledby="tab-organisation-surveys">
                <ProtectedRoute hasAccess={hasWriteAccess} redirectPath={defaultPath}>
                  <OrganisationSurveys />
                </ProtectedRoute>
              </Box>
            }
          />
        )}

        <Route
          path="/responsibles"
          element={
            <Box role="tabpanel" id="tabpanel-responsibles" aria-labelledby="tab-responsibles">
              <Responsibles organisation={organisation} />
            </Box>
          }
        />

        <Route path="/responsibles/xlsx" element={<ResponsiblesXlsx />} />

        <Route
          path="/logs"
          element={
            <Box role="tabpanel" id="tabpanel-logs" aria-labelledby="tab-logs">
              <ProtectedRoute hasAccess={isAdmin} redirectPath={defaultPath}>
                <OrganisationLogs />
              </ProtectedRoute>
            </Box>
          }
        />

        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </>
  )
}

export default Organisation
