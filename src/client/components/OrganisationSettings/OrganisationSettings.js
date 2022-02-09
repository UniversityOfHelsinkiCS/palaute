import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import {
  Box,
  CircularProgress,
  Typography,
  Tab,
  makeStyles,
  Paper,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import CourseSettings from './CourseSettings'
import GeneralSettings from './GeneralSettings'
import EditSurvey from './EditSurvey'
import ProgrammeSummary from './ProgrammeSummary'
import ProgrammeOpenQuestions from './ProgrammeOpenQuestions'
import useOrganisation from '../../hooks/useOrganisation'
import RouterTabs from '../RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'

const useStyles = makeStyles(() => ({
  title: {
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  container: {
    '& .MuiTabs-indicator': {
      display: 'none',
    },
    '& .Mui-selected': {
      borderBottom: `2px solid #1077A1`,
    },
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
  tabContainer: {
    marginRight: 15,
    padding: 10,
  },
  selected: {
    color: ' #1077A1',
    borderBottom: `2px solid #1077A1`,
  },
}))

const OrganisationSettings = () => {
  const { path, url } = useRouteMatch()
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { organisation, isLoading } = useOrganisation(code)
  const classes = useStyles()

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

  const selected = window.location.pathname.split('/').pop()

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(organisation.name, i18n.language)}
        </Typography>
      </Box>
      <Box mb={2} className={classes.hidePrint}>
        <RouterTabs
          indicatorColor="primary"
          textColor="primary"
          className={classes.container}
        >
          <Paper className={classes.tabContainer}>
            <Typography variant="h6" component="h6" className={classes.title}>
              {t('settings')}
            </Typography>
            <Tab
              label={t('organisationSettings:generalTab')}
              component={Link}
              to={`${url}/general`}
              className={selected === 'general' && classes.selected}
            />
            {hasAdminAccess && (
              <Tab
                label={t('organisationSettings:coursesTab')}
                component={Link}
                to={`${url}/courses`}
                className={selected === 'courses' && classes.selected}
              />
            )}
            <Tab
              label={t('organisationSettings:surveyTab')}
              component={Link}
              to={`${url}/survey`}
              className={selected === 'survey' && classes.selected}
            />
          </Paper>
          <Paper className={classes.tabContainer}>
            <Typography variant="h6" component="h6" className={classes.title}>
              {t('feedbacks')}
            </Typography>
            <Tab
              label={t('organisationSettings:summaryTab')}
              component={Link}
              to={`${url}/summary`}
              className={selected === 'summary' && classes.selected}
            />
            <Tab
              label={t('organisationSettings:openQuestionsTab')}
              component={Link}
              to={`${url}/open`}
              className={selected === 'open' && classes.selected}
            />
          </Paper>
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
        <Route path={`${path}/open`}>
          <ProgrammeOpenQuestions />
        </Route>

        <Redirect to={`${path}/general`} />
      </Switch>
    </>
  )
}

export default OrganisationSettings
