import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
} from 'react-router-dom'

import { Box, Typography } from '@mui/material'
import {
  CalendarTodayOutlined,
  CommentOutlined,
  LiveHelpOutlined,
  PollOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import GeneralSettings from './GeneralSettings'
import EditSurvey from './EditSurvey'
import ProgrammeSummary from './ProgrammeSummary'
import ProgrammeOpenQuestions from './ProgrammeOpenQuestions'
import useOrganisation from '../../hooks/useOrganisation'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { getLanguageValue } from '../../util/languageUtils'
import { LoadingProgress } from '../LoadingProgress'
import OrganisationLogs from './OrganisationLogs'
import SemesterOverview from './SemesterOverview'
import Title from '../Title'
import { RouterTab, RouterTabs } from '../RouterTabs'

const OrganisationSettings = () => {
  const { path, url } = useRouteMatch()
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { organisation, isLoading } = useOrganisation(code)
  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()

  if (isLoading) {
    return <LoadingProgress />
  }

  const hasWriteAccess = Boolean(organisation?.access?.write)
  const hasAdminAccess = Boolean(organisation?.access?.admin)

  if (!hasWriteAccess) {
    return <Redirect to="/" />
  }

  const isAdmin = !isUserLoading && authorizedUser.isAdmin

  const name = getLanguageValue(organisation.name, i18n.language)

  return (
    <>
      <Title>{name}</Title>
      <Box mb="3rem" display="flex" alignItems="end">
        <Typography variant="h4" component="h1">
          {name}
        </Typography>
        <Box mr={2} />
        <Typography variant="h5" color="textSecondary">
          {organisation.code}
        </Typography>
      </Box>
      <RouterTabs sx={{ mb: '4rem' }} variant="scrollable" scrollButtons="auto">
        {hasAdminAccess && (
          <RouterTab
            label={t('organisationSettings:settingsTab')}
            icon={<SettingsOutlined />}
            to={`${url}/general`}
          />
        )}
        <RouterTab
          label={t('organisationSettings:surveyTab')}
          icon={<LiveHelpOutlined />}
          to={`${url}/survey`}
        />
        <RouterTab
          label={t('organisationSettings:overviewTab')}
          to={`${url}/upcoming`}
          icon={<CalendarTodayOutlined />}
        />
        <RouterTab
          label={t('organisationSettings:summaryTab')}
          to={`${url}/summary`}
          icon={<PollOutlined />}
        />
        {hasAdminAccess && (
          <RouterTab
            label={t('organisationSettings:openQuestionsTab')}
            to={`${url}/open`}
            icon={<CommentOutlined />}
          />
        )}
        {isAdmin && <RouterTab label="Organisation Logs" to={`${url}/logs`} />}
      </RouterTabs>
      <Switch>
        <Route path={`${path}/general`}>
          <GeneralSettings />
        </Route>

        <Route path={`${path}/upcoming`}>
          <SemesterOverview />
        </Route>

        <Route path={`${path}/survey`}>
          <EditSurvey />
        </Route>

        <Route path={`${path}/summary`}>
          <ProgrammeSummary />
        </Route>

        <Route path={`${path}/open`}>
          <ProgrammeOpenQuestions />
        </Route>

        <Route path={`${path}/logs`}>
          <OrganisationLogs />
        </Route>

        <Redirect to={`${path}/general`} />
      </Switch>
    </>
  )
}

export default OrganisationSettings
