import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Route, Routes } from 'react-router'

import { Box, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { CONFIG_TEST_VALUE, images, PRIVATE_TEST, SHOW_NORPPA_HY_LOGO } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import NorppaFeedbackView from './tabs/NorppaFeedback/NorppaFeedbackView'
import NorppaStatisticView from './tabs/NorppaStatistics/NorppaStatisticsView'
import UpdaterView from './tabs/Updater/UpdaterView'
import Title from '../../components/common/Title'
import { RouterTabs } from '../../components/common/RouterTabs'
import MiscTab from './tabs/Misc/MiscTab'
import FeedbackTargetInspector from './tabs/FeedbackTargetInspector/FeedbackTargetInspector'
import UsersTab from './tabs/Users/UsersTab'
import OrganisationAccess from './tabs/OrganisationAccess/OrganisationAccess'
import FeedbackCorrespondents from './tabs/FeedbackCorrescpondents/FeedbackCorrespondents'
import BannerView from './tabs/Banners/BannersView'
import EnableCourses from './tabs/EnableCourses/EnableCourses'
import CrashDebug from './CrashDebug'
import OrganisationSurveyInspector from './tabs/OrganisationSurveyInspector/OrganisationSurveyInspector'

const ConfigTestValues = () => {
  const { t } = useTranslation()

  return (
    <Typography sx={{ p: '1rem' }} variant="caption" color="textSecondary">
      The secret words are:{' '}
      <Box color="pink">
        {CONFIG_TEST_VALUE}
        <br />
        {PRIVATE_TEST}
        <br />
        {t('test:testValue')}
      </Box>{' '}
      They are used for testing.
    </Typography>
  )
}

const NorppaLogo = () => {
  if (SHOW_NORPPA_HY_LOGO) {
    return <img src={images.norppa_viskaali} alt="" style={{ height: '150px' }} />
  }
  return <div style={{ marginLeft: 'auto' }} />
}

const AdminView = () => {
  const { authorizedUser } = useAuthorizedUser()

  if (!authorizedUser?.isAdmin) return <Redirect to="/" />

  return (
    <>
      <Title>Admin</Title>
      <Box display="flex" alignItems="end">
        <h1>Admin page</h1>

        <NorppaLogo />

        <ConfigTestValues />
        <CrashDebug />
        {SHOW_NORPPA_HY_LOGO && <img src={images.norppa_stylized} alt="" style={{ height: '150px' }} />}
      </Box>
      <Box>
        <RouterTabs indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab label="Users" component={Link} to="/users" />
          <Tab label="Enable courses" component={Link} to="/enable" />
          <Tab label="Organisation Access" component={Link} to="/access" />
          <Tab label="Norppa feedback" component={Link} to="/feedback" />
          <Tab label="Norppa statistics" component={Link} to="/statistics" />
          <Tab label="Search feedback targets" component={Link} to="/feedback-targets" />
          <Tab label="Search organisation surveys" component={Link} to="/organisation-surveys" />
          <Tab label="Palautevastaavat" component={Link} to="/feedback-correspondents" />
          <Tab label="Banners" component={Link} to="/banners" />
          <Tab label="Updater" to="/updater" component={Link} />
          <Tab label="Misc" component={Link} to="/misc" />
        </RouterTabs>
      </Box>
      <Routes>
        <Route path="/users" component={UsersTab} />
        <Route path="/enable" component={EnableCourses} />
        <Route path="/access" component={OrganisationAccess} />
        <Route path="/feedback" component={NorppaFeedbackView} />
        <Route path="/statistics" component={NorppaStatisticView} />
        <Route path="/feedback-targets" component={FeedbackTargetInspector} />
        <Route path="/organisation-surveys" component={OrganisationSurveyInspector} />
        <Route path="/feedback-correspondents" component={FeedbackCorrespondents} />
        <Route path="/banners" component={BannerView} />
        <Route path="/updater" component={UpdaterView} />
        <Route path="/misc" component={MiscTab} />
      </Routes>
    </>
  )
}

export default AdminView
