import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import { Box, Typography, Tab, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'

import CourseSettings from './CourseSettings'
import GeneralSettings from './GeneralSettings'
import FeedbackCorrespondent from './FeedbackCorrespondent'
import EditSurvey from './EditSurvey'
import ProgrammeSummary from './ProgrammeSummary'
import ProgrammeOpenQuestions from './ProgrammeOpenQuestions'
import useOrganisation from '../../hooks/useOrganisation'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { getLanguageValue } from '../../util/languageUtils'
import { LoadingProgress } from '../LoadingProgress'
import OrganisationLogs from './OrganisationLogs'
import SemesterOverview from './SemesterOverview'

const styles = {
  title: {
    marginTop: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  tabContainer: {
    marginRight: 4,
    marginBottom: 4,
    padding: 2,
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
  },
  tabSection: {
    display: 'flex',
    '@media print': {
      display: 'none',
    },
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  tabRow: (theme) => ({
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  }),
  selected: (theme) => ({
    color: ' #1077A1',
    [theme.breakpoints.down('sm')]: {
      borderLeft: `2px solid #1077A1`,
    },
    [theme.breakpoints.up('sm')]: {
      borderBottom: `2px solid #1077A1`,
    },
  }),
}

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
  const selected = window.location.pathname.split('/').pop()

  return (
    <>
      <Box mb={4}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(organisation.name, i18n.language)}
        </Typography>
      </Box>
      <Box mb={2} sx={styles.tabSection}>
        <Paper sx={styles.tabContainer}>
          <Typography variant="subtitle1" component="h6" sx={styles.title}>
            {t('settings')}
          </Typography>
          <Box sx={styles.tabRow}>
            <Tab
              label={t('organisationSettings:generalTab')}
              component={Link}
              to={`${url}/general`}
              sx={selected === 'general' ? styles.selected : {}}
            />
            {hasAdminAccess && (
              <>
                <Tab
                  label={t('organisationSettings:coursesTab')}
                  component={Link}
                  to={`${url}/courses`}
                  sx={selected === 'courses' ? styles.selected : {}}
                />
                <Tab
                  label={t('organisationSettings:feedbackCorrespondentTab')}
                  component={Link}
                  to={`${url}/correspondent`}
                  sx={selected === 'correspondent' ? styles.selected : {}}
                />
              </>
            )}
            <Tab
              label={t('organisationSettings:surveyTab')}
              component={Link}
              to={`${url}/survey`}
              sx={selected === 'survey' ? styles.selected : {}}
            />
            <Tab
              label={t('organisationSettings:overviewTab')}
              component={Link}
              to={`${url}/semester-overview`}
              sx={selected === 'semester-overview' ? styles.selected : {}}
            />
          </Box>
        </Paper>
        <Paper sx={styles.tabContainer}>
          <Typography variant="subtitle1" component="h6" sx={styles.title}>
            {t('feedbacks')}
          </Typography>
          <Box sx={styles.tabRow}>
            <Tab
              label={t('organisationSettings:summaryTab')}
              component={Link}
              to={`${url}/summary`}
              sx={selected === 'summary' ? styles.selected : {}}
            />
            {hasAdminAccess && (
              <Tab
                label={t('organisationSettings:openQuestionsTab')}
                component={Link}
                to={`${url}/open`}
                sx={selected === 'open' ? styles.selected : {}}
              />
            )}
          </Box>
        </Paper>
        {isAdmin && (
          <Paper sx={styles.tabContainer}>
            <Typography variant="subtitle1" component="h6" sx={styles.title}>
              Admin
            </Typography>
            <Tab
              label="Organisation Logs"
              component={Link}
              to={`${url}/logs`}
              sx={selected === 'logs' ? styles.selected : {}}
            />
          </Paper>
        )}
      </Box>

      <Switch>
        <Route path={`${path}/general`}>
          <GeneralSettings />
        </Route>

        <Route path={`${path}/semester-overview`}>
          <SemesterOverview />
        </Route>

        <Route path={`${path}/courses`}>
          <CourseSettings />
        </Route>

        <Route path={`${path}/correspondent`}>
          <FeedbackCorrespondent />
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
