import React from 'react'
import { intersection } from 'lodash-es'
import { Navigate, Route, Routes, useMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { Box, Typography } from '@mui/material'
import { BarChartOutlined, School, LocationCity } from '@mui/icons-material'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import MyOrganisations from './MyOrganisations'
import University from './University'
import { updateSummaries } from './api'
import { RouterTab, RouterTabs } from '../../components/common/RouterTabs'
import MyCourses from './MyCourses'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS } from '../../util/common'
import GenerateReport from './GenerateReport'
import { SummaryContextProvider } from './context'
import ForCourseUnitGroup from './ForCourseUnitGroup'
import Title from '../../components/common/Title'
import { NorButton } from '../../components/common/NorButton'

const SummaryInContext = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { authorizedUser: user } = useAuthorizedUser()
  const { pathnameBase } = useMatch('/course-summary/*')

  const { search } = window.location
  const preferredView = user?.preferences?.summaryView ?? 'my-organisations'
  const defaultPath = `${pathnameBase}/${preferredView}`

  const handleUpdateData = async forceAll => {
    const duration = await updateSummaries({ forceAll })
    if (duration) enqueueSnackbar(`Valmis, kesti ${(duration / 1000).toFixed()} sekuntia`)
  }

  const hasAccessToMyOrganisations = Object.keys(user?.organisationAccess ?? {}).length > 0
  const hasAccessToUniversityLevel =
    user?.isAdmin ||
    intersection(UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS, Object.keys(user?.specialGroup ?? {})).length > 0

  return (
    <>
      <Box mb="6rem" px={1}>
        <Title>{t('courseSummary:heading')}</Title>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('courseSummary:heading')}
          </Typography>
          <GenerateReport />
        </Box>
        {user?.isAdmin && (
          <Box sx={{ marginTop: 2 }}>
            <NorButton
              sx={{ marginRight: 2 }}
              color="secondary"
              onClick={() => handleUpdateData(false)}
              data-cy="update-data"
            >
              Aja datanpäivitys (Nykyisille ajanjaksoille)
            </NorButton>
            <NorButton color="secondary" onClick={() => handleUpdateData(true)} data-cy="force-update-data">
              Aja datanpäivitys (Koko historialle)
            </NorButton>
          </Box>
        )}
      </Box>
      <RouterTabs variant="scrollable" scrollButtons="auto">
        <RouterTab
          label={t('courseSummary:myCourses')}
          icon={<School />}
          to={`/course-summary/my-courses${search}`}
          data-cy="my-courses"
        />

        {hasAccessToMyOrganisations && (
          <RouterTab
            label={t('courseSummary:myOrganisations')}
            icon={<BarChartOutlined />}
            to={`/course-summary/my-organisations${search}`}
            data-cy="my-organisations"
          />
        )}

        {hasAccessToUniversityLevel && (
          <RouterTab
            label={t('common:university')}
            icon={<LocationCity />}
            to={`/course-summary/university${search}`}
            data-cy="university"
          />
        )}
      </RouterTabs>
      <SummaryScrollContainer>
        <Routes>
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute hasAccess>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-organisations"
            element={
              <ProtectedRoute redirectPath={defaultPath} hasAccess={hasAccessToMyOrganisations}>
                <MyOrganisations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/university"
            element={
              <ProtectedRoute redirectPath={defaultPath} hasAccess={hasAccessToUniversityLevel}>
                <University />
              </ProtectedRoute>
            }
          />

          <Route path="/course-unit/:code" element={<ForCourseUnitGroup />} />

          <Route path="*" element={<Navigate to={defaultPath} />} />
        </Routes>
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
