import React, { forwardRef } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Route, Switch, useRouteMatch, useHistory } from 'react-router'

import { Box, Button, Tab, makeStyles } from '@material-ui/core'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'

import { ADMINS } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import NorppaFeedbackView from './NorppaFeedbackView'
import NorppaStatisticView from './NorppaStatisticsView'
import UpdaterView from './UpdaterView'
import Title from '../Title'
import useUpdaterStatus from '../../hooks/useUpdaterStatus'
import RouterTabs from '../RouterTabs'
import GeneralTab from './GeneralTab'

const useStyles = makeStyles(() => ({
  failureIcon: {
    color: 'red',
    marginLeft: 5,
  },
  runningIcon: {
    color: 'orange',
    marginLeft: 5,
  },
}))

const AdminView = () => {
  const { path, url } = useRouteMatch()
  const history = useHistory()

  const { authorizedUser } = useAuthorizedUser()

  const classes = useStyles()

  const { updaterStatus } = useUpdaterStatus({
    refetchInterval: 10_000,
  })

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  const updaterIcon = (
    <>
      Updater
      {updaterStatus?.status === 'RUNNING' && (
        <AccessTimeIcon className={classes.runningIcon} />
      )}
      {updaterStatus?.status === 'FAILURE' && (
        <ErrorOutlineIcon className={classes.failureIcon} />
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
          <Tab label="General" component={Link} to={`${url}/general`} />
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
        </RouterTabs>
      </Box>
      <Switch>
        <Route path={`${path}/general`} component={GeneralTab} />
        <Route path={`${path}/feedback`} component={NorppaFeedbackView} />
        <Route path={`${path}/statistics`} component={NorppaStatisticView} />
        <Route path={`${path}/updater`} component={UpdaterView} />
      </Switch>
    </>
  )
}

export default AdminView
