import React, { forwardRef } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Route, Switch, useRouteMatch, useHistory } from 'react-router'

import { Box, Button, Tab } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import { ADMINS } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import NorppaFeedbackView from './NorppaFeedbackView'
import NorppaStatisticView from './NorppaStatisticsView'
import UpdaterView from './UpdaterView'
import Title from '../Title'
import useUpdaterStatus from '../../hooks/useUpdaterStatus'
import RouterTabs from '../RouterTabs'
import MiscTab from './MiscTab'
import { ChangedClosingDates } from './ChangedClosingDates'
import FeedbackTargetInspector from './FeedbackTargetInspector'
import UsersTab from './UsersTab'

const styles = {
  failureIcon: {
    color: 'red',
    marginLeft: 5,
  },
  runningIcon: {
    color: 'orange',
    marginLeft: 5,
  },
}

const AdminView = () => {
  const { path, url } = useRouteMatch()
  const history = useHistory()

  const { authorizedUser } = useAuthorizedUser()

  const { updaterStatus } = useUpdaterStatus({
    refetchInterval: 10_000,
  })

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  const updaterIcon = (
    <>
      Updater
      {updaterStatus?.status === 'RUNNING' && (
        <AccessTimeIcon sx={styles.runningIcon} />
      )}
      {updaterStatus?.status === 'FAILURE' && (
        <ErrorOutlineIcon sx={styles.failureIcon} />
      )}
    </>
  )

  return (
    <>
      <h1>Admin page</h1>
      <Title>Admin</Title>
      <Box>
        <RouterTabs
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Users" component={Link} to={`${url}/users`} />
          <Tab
            label="Norppa feedback"
            component={Link}
            to={`${url}/feedback`}
          />
          <Tab
            label="Norppa statistics"
            component={Link}
            to={`${url}/statistics`}
          />
          <Tab
            label="Changed dates"
            component={Link}
            to={`${url}/changed-dates`}
          />
          <Tab
            label="Search feedback targets"
            component={Link}
            to={`${url}/feedback-targets`}
          />
          <Tab
            to={`${url}/updater`}
            component={forwardRef((props, ref) => (
              <Button
                ref={ref}
                onClick={() => history.push(`${url}/updater`)}
                className={`MuiTab-root MuiTab-textColorPrimary ${
                  history.location.pathname.indexOf('updater') > -1 &&
                  'Mui-selected'
                }`}
              >
                {updaterIcon}
              </Button>
            ))}
          />
          <Tab label="Misc" component={Link} to={`${url}/misc`} />
        </RouterTabs>
      </Box>
      <Switch>
        <Route path={`${path}/users`} component={UsersTab} />
        <Route path={`${path}/feedback`} component={NorppaFeedbackView} />
        <Route path={`${path}/statistics`} component={NorppaStatisticView} />
        <Route path={`${path}/changed-dates`} component={ChangedClosingDates} />
        <Route
          path={`${path}/feedback-targets`}
          component={FeedbackTargetInspector}
        />
        <Route path={`${path}/updater`} component={UpdaterView} />
        <Route path={`${path}/misc`} component={MiscTab} />
      </Switch>
    </>
  )
}

export default AdminView
