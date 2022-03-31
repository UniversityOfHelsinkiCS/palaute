import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import { Box, Button, Tabs, Tab } from '@material-ui/core'
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

const AdminView = () => {
  const [tab, setTab] = useState(0)
  const { authorizedUser } = useAuthorizedUser()

  useEffect(() => {
    document.title = 'Admin'
  }, [])

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  const resetTestCourse = async () => {
    await apiClient.post('/admin/reset-course', {})
  }

  const changeTab = (event, newValue) => {
    setTab(newValue)
  }

  return (
    <>
      <h1>Admin page</h1>
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
          <Tab label="Updater" {...tabProps(3)} />
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
        <UpdaterView />
      </TabPanel>
    </>
  )
}

export default AdminView
