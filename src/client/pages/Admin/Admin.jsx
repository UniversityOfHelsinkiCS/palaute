import React from 'react'
import { Link } from 'react-router-dom'
import { Navigate, Route, Routes } from 'react-router'

import { Box, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { CONFIG_TEST_VALUE, PRIVATE_TEST } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import NorppaFeedbackView from './tabs/NorppaFeedback/NorppaFeedbackView'
import NorppaStatisticView from './tabs/NorppaStatistics/NorppaStatisticsView'
import UpdaterView from './tabs/Updater/UpdaterView'
import Title from '../../components/common/Title'
import { RouterTabs } from '../../components/common/RouterTabs'
import MiscTab from './tabs/Misc/MiscTab'
import FeedbackTargetInspector from './tabs/FeedbackTargetInspector/FeedbackTargetInspector'
import UsersTab from './tabs/Users/UsersTab'
import FeedbackCorrespondents from './tabs/FeedbackCorrescpondents/FeedbackCorrespondents'
import BannerView from './tabs/Banners/BannersView'
import EnableCourses from './tabs/EnableCourses/EnableCourses'
import CrashDebug from './CrashDebug'
import OrganisationSurveyInspector from './tabs/OrganisationSurveyInspector/OrganisationSurveyInspector'

const ConfigTestValues = () => {
  const { t } = useTranslation()

  return (
    <Typography variant="caption" color="textSecondary">
      The secret words are:{' '}
      <Box color="pink">
        {CONFIG_TEST_VALUE} {PRIVATE_TEST}
        {t('test:testValue')}
      </Box>
      They are used for testing.
    </Typography>
  )
}

const AdminView = () => {
  const { authorizedUser } = useAuthorizedUser()

  if (!authorizedUser?.isAdmin) return <Navigate to="/" />

  return (
    <>
      <Title>Admin Page</Title>
      <Box display="flex" gap="1rem" alignItems="start">
        <Typography variant="h4" component="h1">
          Admin Page
        </Typography>
        <Box display="flex" marginLeft="auto" alignItems="center" gap={4}>
          <ConfigTestValues />
          <CrashDebug />
        </Box>
      </Box>
      <Box>
        <RouterTabs indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab label="Users" component={Link} to="/admin/users" />
          <Tab label="Enable courses" component={Link} to="/admin/enable" />
          <Tab label="Norppa feedback" component={Link} to="/admin/feedback" />
          <Tab label="Norppa statistics" component={Link} to="/admin/statistics" />
          <Tab label="Search feedback targets" component={Link} to="/admin/feedback-targets" />
          <Tab label="Search organisation surveys" component={Link} to="/admin/organisation-surveys" />
          <Tab label="Palautevastaavat" component={Link} to="/admin/feedback-correspondents" />
          <Tab label="Banners" component={Link} to="/admin/banners" />
          <Tab label="Updater" component={Link} to="/admin/updater" />
          <Tab label="Misc" component={Link} to="/admin/misc" />
        </RouterTabs>
      </Box>
      <Routes>
        <Route path="/users" element={<UsersTab />} />
        <Route path="/enable" element={<EnableCourses />} />
        <Route path="/feedback" element={<NorppaFeedbackView />} />
        <Route path="/statistics" element={<NorppaStatisticView />} />
        <Route path="/feedback-targets" element={<FeedbackTargetInspector />} />
        <Route path="/organisation-surveys" element={<OrganisationSurveyInspector />} />
        <Route path="/feedback-correspondents" element={<FeedbackCorrespondents />} />
        <Route path="/banners" element={<BannerView />} />
        <Route path="/updater" element={<UpdaterView />} />
        <Route path="/misc" element={<MiscTab />} />
      </Routes>
    </>
  )
}

export default AdminView
