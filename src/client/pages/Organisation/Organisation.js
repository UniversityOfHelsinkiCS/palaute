import React from 'react'

import { Route, Switch, useRouteMatch, useParams, Redirect } from 'react-router-dom'

import { Box, Typography } from '@mui/material'
import {
  CalendarTodayOutlined,
  CommentOutlined,
  LiveHelpOutlined,
  PollOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import EditSurvey from './EditSurvey'
import GeneralSettings from './GeneralSettings'
import ProgrammeOpenQuestions from './ProgrammeOpenQuestions'
import useOrganisation from '../../hooks/useOrganisation'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { getLanguageValue } from '../../util/languageUtils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import OrganisationLogs from './OrganisationLogs'
import SemesterOverview from './SemesterOverview'
import Title from '../../components/common/Title'
import { RouterTab, RouterTabs } from '../../components/common/RouterTabs'
import OrganisationSummary from '../CourseSummary/OrganisationSummary'
import ErrorView from '../../components/common/ErrorView'
import errors from '../../util/errorMessage'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { links } from '../../util/links'
import LinkButton from '../../components/common/LinkButton'

const Organisation = () => {
  const { path, url } = useRouteMatch()
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
    return <Redirect to="/" />
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
      <Box mb={'1rem'}>
        <LinkButton to={links.organisationInstructions[i18n.language]} title={t('footer:wikiLink')} external />
      </Box>
      <RouterTabs sx={{ mb: '4rem' }} variant="scrollable" scrollButtons="auto">
        {hasAdminAccess && (
          <RouterTab label={t('organisationSettings:settingsTab')} icon={<SettingsOutlined />} to={`${url}/settings`} />
        )}
        {hasWriteAccess && (
          <RouterTab label={t('organisationSettings:surveyTab')} icon={<LiveHelpOutlined />} to={`${url}/survey`} />
        )}
        <RouterTab
          label={t('organisationSettings:overviewTab')}
          to={`${url}/upcoming`}
          icon={<CalendarTodayOutlined />}
        />
        <RouterTab label={t('organisationSettings:summaryTab')} to={`${url}/summary`} icon={<PollOutlined />} />
        {hasAdminAccess && (
          <RouterTab label={t('organisationSettings:openQuestionsTab')} to={`${url}/open`} icon={<CommentOutlined />} />
        )}
        {isAdmin && <RouterTab label="Organisation Logs" to={`${url}/logs`} />}
      </RouterTabs>
      <Switch>
        <ProtectedRoute
          path={`${path}/settings`}
          hasAccess={hasAdminAccess}
          redirect={`${url}/summary`}
          component={GeneralSettings}
        />

        <Route path={`${path}/upcoming`}>
          <SemesterOverview organisation={organisation} />
        </Route>

        <ProtectedRoute
          path={`${path}/survey`}
          hasAccess={hasWriteAccess}
          redirect={`${url}/summary`}
          component={EditSurvey}
        />

        <Route path={`${path}/summary`}>
          <OrganisationSummary />
        </Route>

        <ProtectedRoute
          path={`${path}/open`}
          hasAccess={hasAdminAccess}
          redirect={`${url}/summary`}
          component={ProgrammeOpenQuestions}
        />

        <ProtectedRoute
          path={`${path}/logs`}
          hasAccess={isAdmin}
          redirect={`${url}/summary`}
          component={OrganisationLogs}
        />

        <Redirect to={`${path}/summary`} />
      </Switch>
    </>
  )
}

export default Organisation
