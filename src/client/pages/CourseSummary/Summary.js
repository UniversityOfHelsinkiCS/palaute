import React from 'react'
import _ from 'lodash'
import { Redirect, Route, Switch } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { Box, Button, Typography } from '@mui/material'
import { BarChartOutlined, School } from '@mui/icons-material'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import MyOrganisations from './MyOrganisations'
import University from './University'
import { updateSummaries } from './api'
import { RouterTab, RouterTabs } from '../../components/common/RouterTabs'
import hyLogo from '../../assets/hy_logo_black.svg'
import MyCourses from './MyCourses'
import SummaryScrollContainer from './SummaryScrollContainer'
import { UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS } from '../../util/common'
import GenerateReport from './GenerateReport'
import CourseRealisationSummary from './CourseRealisationSummary'
import { SummaryContextProvider } from './context'

const SummaryInContext = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { search } = window.location

  const handleUpdateData = async () => {
    const duration = await updateSummaries()
    if (duration) enqueueSnackbar(`Valmis, kesti ${(duration / 1000).toFixed()} sekuntia`)
  }

  const { authorizedUser: user } = useAuthorizedUser()

  const preferredView = user?.preferences?.summaryView ?? 'my-organisations'

  const hasAccessToMyOrganisations = Object.keys(user?.organisationAccess ?? {}).length > 0
  const hasAccessToUniversityLevel =
    user?.isAdmin ||
    _.intersection(UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS, Object.keys(user?.specialGroup ?? {})).length > 0

  return (
    <>
      <Box mb="6rem" px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('courseSummary:heading')}
          </Typography>
          <GenerateReport />
        </Box>
        {user?.isAdmin && (
          <Button variant="text" onClick={handleUpdateData}>
            Aja datanpäivitys (vain admin)
          </Button>
        )}
      </Box>
      <RouterTabs variant="scrollable" scrollButtons="auto">
        <RouterTab label={t('courseSummary:myCourses')} icon={<School />} to={`/course-summary/my-courses${search}`} />

        {hasAccessToMyOrganisations && (
          <RouterTab
            label={t('courseSummary:myOrganisations')}
            icon={<BarChartOutlined />}
            to={`/course-summary/my-organisations${search}`}
          />
        )}

        {hasAccessToUniversityLevel && (
          <RouterTab
            label={t('common:university')}
            icon={
              <Box sx={{ width: '1.5rem', height: 'auto' }}>
                <img src={hyLogo} alt="HY" />
              </Box>
            }
            to={`/course-summary/university${search}`}
          />
        )}
      </RouterTabs>
      <SummaryScrollContainer>
        <Switch>
          <ProtectedRoute path="/course-summary/my-courses" component={MyCourses} hasAccess />

          <ProtectedRoute
            path="/course-summary/my-organisations"
            redirectPath="/course-summary/my-courses"
            component={MyOrganisations}
            hasAccess={hasAccessToMyOrganisations}
          />

          <ProtectedRoute
            path="/course-summary/university"
            redirectPath="/course-summary/my-courses"
            component={University}
            hasAccess={hasAccessToUniversityLevel}
          />

          <Route path="/course-summary/:code">
            <CourseRealisationSummary />
          </Route>

          <Route path="/course-summary" exact>
            <Redirect to={`/course-summary/${preferredView}`} />
          </Route>
        </Switch>
      </SummaryScrollContainer>
    </>
  )
}

const Summary = () => (
  <SummaryContextProvider>
    <SummaryInContext />
  </SummaryContextProvider>
)

export default Summary
