import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Route, Switch, useRouteMatch, useHistory } from 'react-router'

import { Box, Tab } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import { ADMINS, images } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import NorppaFeedbackView from './NorppaFeedbackView'
import NorppaStatisticView from './NorppaStatisticsView'
import UpdaterView from './UpdaterView'
import Title from '../common/Title'
import useUpdaterStatus from '../../hooks/useUpdaterStatus'
import { RouterTabs } from '../common/RouterTabs'
import MiscTab from './MiscTab'
import FeedbackTargetInspector from './FeedbackTargetInspector'
import UsersTab from './UsersTab'
import FeedbackCorrespondents from './FeedbackCorrespondents'

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
      <Title>Admin</Title>
      <Box display="flex" alignItems="end">
        <h1>Admin page</h1>
        <img
          src={images.norppa_viskaali}
          alt="Epic norppa by ttriple"
          sx={{ height: '1vh' }}
        />
      </Box>
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
            label="Search feedback targets"
            component={Link}
            to={`${url}/feedback-targets`}
          />
          <Tab
            label="Palautevastaavat"
            component={Link}
            to={`${url}/feedback-correspondents`}
          />
          <Tab label="Updater" to={`${url}/updater`} component={Link} />
          <Tab label="Misc" component={Link} to={`${url}/misc`} />
        </RouterTabs>
      </Box>
      <Switch>
        <Route path={`${path}/users`} component={UsersTab} />
        <Route path={`${path}/feedback`} component={NorppaFeedbackView} />
        <Route path={`${path}/statistics`} component={NorppaStatisticView} />
        <Route
          path={`${path}/feedback-targets`}
          component={FeedbackTargetInspector}
        />
        <Route
          path={`${path}/feedback-correspondents`}
          component={FeedbackCorrespondents}
        />
        <Route path={`${path}/updater`} component={UpdaterView} />
        <Route path={`${path}/misc`} component={MiscTab} />
      </Switch>
    </>
  )
}

export default AdminView
