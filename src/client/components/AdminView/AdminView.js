import React, { forwardRef, useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Box, Button, Tabs, Tab, makeStyles } from '@material-ui/core'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'

import { ADMINS } from '../../util/common'
import apiClient from '../../util/apiClient'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import LoginAs from './LoginAsSelector'
import EditUniversitySurveyAccordion from './EditUniversitySurveyAccordion'
import EmailAccordion from './EmailAccordion'
import { tabProps, TabPanel } from './AdminTabPanel'
import NorppaFeedbackView from './NorppaFeedbackView'
import NorppaStatisticView from './NorppaStatisticsView'
import UpdaterView from './UpdaterView'
import Title from '../Title'
import useUpdaterStatus from '../../hooks/useUpdaterStatus'
import { ChangedClosingDates } from './ChangedClosingDates'

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
  const [tab, setTab] = useState(0)
  const { authorizedUser } = useAuthorizedUser()

  const classes = useStyles()

  const { updaterStatus, isLoading, refetch } = useUpdaterStatus({
    refetchInterval: 10_000,
  })

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  const resetTestCourse = async () => {
    await apiClient.post('/admin/reset-course', {})
  }

  const changeTab = (event, newValue) => {
    setTab(newValue)
  }

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
        <Tabs
          value={tab}
          onChange={changeTab}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="General" {...tabProps(0)} />
          <Tab label="Norppa feedback" {...tabProps(1)} />
          <Tab label="Norppa statistics" {...tabProps(2)} />
          <Tab label="Changed closing dates" {...tabProps(3)} />
          <Tab
            component={forwardRef((props, ref) => (
              <Button
                ref={ref}
                onClick={() => setTab(4)}
                className={`MuiTab-root MuiTab-textColorPrimary ${
                  tab === 4 && 'Mui-selected'
                }`}
              >
                {updaterIcon}
              </Button>
            ))}
          />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <LoginAs />
        <EditUniversitySurveyAccordion />
        <EmailAccordion />
        <Button variant="contained" color="primary" onClick={resetTestCourse}>
          Reset test course
        </Button>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <NorppaFeedbackView />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <NorppaStatisticView />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <ChangedClosingDates language="fi" />
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <UpdaterView
          updaterStatus={updaterStatus}
          isLoading={isLoading}
          refetch={refetch}
        />
      </TabPanel>
    </>
  )
}

export default AdminView
