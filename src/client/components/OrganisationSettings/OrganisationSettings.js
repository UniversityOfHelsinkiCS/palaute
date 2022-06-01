import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import { Box, Typography, Tab, makeStyles, Paper } from '@material-ui/core'
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

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: 8,
    marginBottom: 20,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  tabContainer: {
    marginRight: 15,
    marginBottom: 15,
    padding: 10,
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
  tabRow: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  selected: {
    color: ' #1077A1',
    [theme.breakpoints.down('xs')]: {
      borderLeft: `2px solid #1077A1`,
    },
    [theme.breakpoints.up('sm')]: {
      borderBottom: `2px solid #1077A1`,
    },
  },
}))

const OrganisationSettings = () => {
  const { path, url } = useRouteMatch()
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { organisation, isLoading } = useOrganisation(code)
  const classes = useStyles()
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
      <Box mb={2} className={classes.tabSection}>
        <Paper className={classes.tabContainer}>
          <Typography
            variant="subtitle1"
            component="h6"
            className={classes.title}
          >
            {t('settings')}
          </Typography>
          <Box className={classes.tabRow}>
            <Tab
              label={t('organisationSettings:generalTab')}
              component={Link}
              to={`${url}/general`}
              className={selected === 'general' ? classes.selected : ''}
            />
            {hasAdminAccess && (
              <>
                <Tab
                  label={t('organisationSettings:coursesTab')}
                  component={Link}
                  to={`${url}/courses`}
                  className={selected === 'courses' ? classes.selected : ''}
                />
                <Tab
                  label={t('organisationSettings:feedbackCorrespondentTab')}
                  component={Link}
                  to={`${url}/correspondent`}
                  className={selected === 'responsible' ? classes.selected : ''}
                />
              </>
            )}
            <Tab
              label={t('organisationSettings:surveyTab')}
              component={Link}
              to={`${url}/survey`}
              className={selected === 'survey' ? classes.selected : ''}
            />
          </Box>
        </Paper>
        <Paper className={classes.tabContainer}>
          <Typography
            variant="subtitle1"
            component="h6"
            className={classes.title}
          >
            {t('feedbacks')}
          </Typography>
          <Box className={classes.tabRow}>
            <Tab
              label={t('organisationSettings:summaryTab')}
              component={Link}
              to={`${url}/summary`}
              className={selected === 'summary' ? classes.selected : ''}
            />
            <Tab
              label={t('organisationSettings:openQuestionsTab')}
              component={Link}
              to={`${url}/open`}
              className={selected === 'open' ? classes.selected : ''}
            />
          </Box>
        </Paper>
        {isAdmin && (
          <Paper className={classes.tabContainer}>
            <Typography
              variant="subtitle1"
              component="h6"
              className={classes.title}
            >
              Admin
            </Typography>
            <Tab
              label="Organisation Logs"
              component={Link}
              to={`${url}/logs`}
              className={selected === 'logs' ? classes.selected : ''}
            />
          </Paper>
        )}
      </Box>

      <Switch>
        <Route path={`${path}/general`}>
          <GeneralSettings />
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
