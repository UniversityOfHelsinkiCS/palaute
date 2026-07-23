import { BarChartOutlined, School } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useMatch } from 'react-router-dom'

import { NorButton } from '../../components/common/NorButton'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { RouterTab, RouterTabs } from '../../components/common/RouterTabs'
import Title from '../../components/common/Title'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { updateSummaries } from './api'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { SummaryContextProvider } from './context'
import ForCourseUnitGroup from './ForCourseUnitGroup'
import GenerateReport from './GenerateReport'
import MyCourses from './MyCourses'
import MyOrganisations from './MyOrganisations'

const SummaryInContext = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { authorizedUser: user } = useAuthorizedUser()
  const { pathnameBase } = useMatch('/course-summary/*')

  const { search } = window.location
  const preferredView = user?.preferences?.summaryView ?? 'my-organisations'
  const defaultPath = `${pathnameBase}/${preferredView}`

  const [tableView, setTableView] = useState(false)

  const handleUpdateData = async forceAll => {
    const duration = await updateSummaries({ forceAll })
    if (duration) enqueueSnackbar(`Valmis, kesti ${(duration / 1000).toFixed()} sekuntia`)
  }

  const hasAccessToMyOrganisations = Object.keys(user?.organisationAccess ?? {}).length > 0

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Title>{t('courseSummary:heading')}</Title>
        <Box
          sx={{
            display: 'flex',
            rowGap: 2,
            columnGap: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h4" component="h1">
            {t('courseSummary:heading')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user.isAdmin && (
              <NorButton color="secondary" onClick={() => setTableView(!tableView)} sx={{ p: 1 }}>
                {tableView ? t('courseSummary:treeView') : t('courseSummary:tableView')}
              </NorButton>
            )}
            <GenerateReport />
          </Box>
        </Box>
        {user?.isAdmin && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: 2 }}>
            <NorButton color="secondary" onClick={() => handleUpdateData(false)} data-cy="update-data">
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
          tabId="my-courses"
          data-cy="my-courses"
        />

        {hasAccessToMyOrganisations && (
          <RouterTab
            label={t('courseSummary:myOrganisations')}
            icon={<BarChartOutlined />}
            to={`/course-summary/my-organisations${search}`}
            tabId="my-organisations"
            data-cy="my-organisations"
          />
        )}
      </RouterTabs>
      <SummaryScrollContainer>
        <Routes>
          <Route
            path="/my-courses"
            element={
              <Box role="tabpanel" id="tabpanel-my-courses" aria-labelledby="tab-my-courses">
                <ProtectedRoute hasAccess>
                  <MyCourses tableView={tableView} />
                </ProtectedRoute>
              </Box>
            }
          />

          <Route
            path="/my-organisations"
            element={
              <Box role="tabpanel" id="tabpanel-my-organisations" aria-labelledby="tab-my-organisations">
                <ProtectedRoute redirectPath={defaultPath} hasAccess={hasAccessToMyOrganisations}>
                  <MyOrganisations />
                </ProtectedRoute>
              </Box>
            }
          />

          <Route path="/course-unit/:code" element={<ForCourseUnitGroup tableView={tableView} />} />

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
