import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Route, Switch, useRouteMatch } from 'react-router'

import { Box, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { CONFIG_TEST_VALUE, images, PRIVATE_TEST } from '../../util/common'
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

const AdminView = () => {
  const { path, url } = useRouteMatch()

  const { authorizedUser } = useAuthorizedUser()

  if (!authorizedUser?.isAdmin) return <Redirect to="/" />

  return (
    <>
      <Title>Admin</Title>
      <Box display="flex" alignItems="end">
        <h1>Admin page</h1>
        <img src={images.norppa_viskaali} alt="Epic norppa by ttriple" style={{ height: '150px' }} />
        <ConfigTestValues />
        <CrashDebug />
      </Box>
      <Box>
        <RouterTabs indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab label="Users" component={Link} to={`${url}/users`} />
          <Tab label="Enable courses" component={Link} to={`${url}/enable`} />
          <Tab label="Organisation Access" component={Link} to={`${url}/access`} />
          <Tab label="Norppa feedback" component={Link} to={`${url}/feedback`} />
          <Tab label="Norppa statistics" component={Link} to={`${url}/statistics`} />
          <Tab label="Search feedback targets" component={Link} to={`${url}/feedback-targets`} />
          <Tab label="Search organisation surveys" component={Link} to={`${url}/organisation-surveys`} />
          <Tab label="Palautevastaavat" component={Link} to={`${url}/feedback-correspondents`} />
          <Tab label="Banners" component={Link} to={`${url}/banners`} />
          <Tab label="Updater" to={`${url}/updater`} component={Link} />
          <Tab label="Misc" component={Link} to={`${url}/misc`} />
        </RouterTabs>
      </Box>
      <Switch>
        <Route path={`${path}/users`} component={UsersTab} />
        <Route path={`${path}/enable`} component={EnableCourses} />
        <Route path={`${path}/access`} component={OrganisationAccess} />
        <Route path={`${path}/feedback`} component={NorppaFeedbackView} />
        <Route path={`${path}/statistics`} component={NorppaStatisticView} />
        <Route path={`${path}/feedback-targets`} component={FeedbackTargetInspector} />
        <Route path={`${path}/organisation-surveys`} component={OrganisationSurveyInspector} />
        <Route path={`${path}/feedback-correspondents`} component={FeedbackCorrespondents} />
        <Route path={`${path}/banners`} component={BannerView} />
        <Route path={`${path}/updater`} component={UpdaterView} />
        <Route path={`${path}/misc`} component={MiscTab} />
      </Switch>
    </>
  )
}

export default AdminView
