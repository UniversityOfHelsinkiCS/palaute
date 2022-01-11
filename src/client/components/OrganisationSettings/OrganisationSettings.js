import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import { Box, CircularProgress, Typography, Tab } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import CourseSettings from './CourseSettings'
import GeneralSettings from './GeneralSettings'
import EditSurvey from './EditSurvey'
import ProgrammeSummary from './ProgrammeSummary'
import useOrganisation from '../../hooks/useOrganisation'
import RouterTabs from '../RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'

const OrganisationSettings = () => {
  const { path, url } = useRouteMatch()
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { organisation, isLoading } = useOrganisation(code)

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  const hasWriteAccess = Boolean(organisation?.access?.write)
  const hasAdminAccess = Boolean(organisation?.access?.admin)

  if (!hasWriteAccess) {
    return <Redirect to="/" />
  }

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(organisation.name, i18n.language)}
        </Typography>
      </Box>
      <Box mb={2}>
        <RouterTabs
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={t('organisationSettings:generalTab')}
            component={Link}
            to={`${url}/general`}
          />
          {hasAdminAccess && (
            <Tab
              label={t('organisationSettings:coursesTab')}
              component={Link}
              to={`${url}/courses`}
            />
          )}
          <Tab
            label={t('organisationSettings:surveyTab')}
            component={Link}
            to={`${url}/survey`}
          />
          <Tab
            label={t('organisationSettings:summaryTab')}
            component={Link}
            to={`${url}/summary`}
          />
        </RouterTabs>
      </Box>

      <Switch>
        <Route path={`${path}/general`}>
          <GeneralSettings />
        </Route>

        <Route path={`${path}/courses`}>
          <CourseSettings />
        </Route>

        <Route path={`${path}/survey`}>
          <EditSurvey />
        </Route>

        <Route path={`${path}/summary`}>
          <ProgrammeSummary />
        </Route>

        <Redirect to={`${path}/general`} />
      </Switch>
    </>
  )
}

export default OrganisationSettings
