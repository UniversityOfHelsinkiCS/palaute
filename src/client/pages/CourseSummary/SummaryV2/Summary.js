import React from 'react'
import { Switch } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { Alert, Box, Button, Typography } from '@mui/material'
import { BarChartOutlined } from '@mui/icons-material'
import { SummaryContextProvider, useSummaryContext } from './context'
import useAuthorizedUser from '../../../hooks/useAuthorizedUser'
import ProtectedRoute from '../../../components/common/ProtectedRoute'
import MyOrganisations from './MyOrganisations'
import { inProduction } from '../../../util/common'
import University from './University'
import { updateSummaries } from './api'
import LinkButton from '../../../components/common/LinkButton'
import { YearSemesterSelector } from '../../../components/common/YearSemesterSelector'
import { RouterTab, RouterTabs } from '../../../components/common/RouterTabs'
import hyLogo from '../../../assets/hy_logo_black.svg'

const SummaryInContext = () => {
  const { dateRange, setDateRange, option, setOption } = useSummaryContext()
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [, startTransition] = React.useTransition()

  const handleUpdateData = async () => {
    const duration = await updateSummaries()
    if (duration) enqueueSnackbar(`Valmis, kesti ${(duration / 1000).toFixed()} sekuntia`)
  }

  const handleChangeTimeRange = nextDateRange => {
    startTransition(() => {
      setDateRange(nextDateRange)
    })
  }

  const { authorizedUser: user } = useAuthorizedUser()

  return (
    <>
      <Box mb="6rem" px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            {t('courseSummary:heading')}
          </Typography>
          <LinkButton to="/course-summary" title="Vanha" />
        </Box>
        <Button variant="text" onClick={handleUpdateData}>
          Aja datanpäivitys
        </Button>
      </Box>
      <Box display="flex" pb="2rem" justifyContent="space-between" alignItems="end">
        <YearSemesterSelector
          value={dateRange ?? { start: new Date(), end: new Date() }}
          onChange={handleChangeTimeRange}
          option={option}
          setOption={setOption}
        />
        <Alert severity="info" sx={{ whiteSpace: 'pre-wrap', mb: '1rem' }}>
          Tässä näkymässä lukuvuosi alkaa 1.8. ja päättyy 1.8. seuraavana vuonna.{'\n'}
          Kevätlukukausi alkaa 1.1. ja päättyy 1.8.{'\n'}
          Syyslukukausi alkaa 1.8. ja päättyy 1.1. seuraavana vuonna.{'\n'}
          {'\n'}
          Jos kurssitoteutuksen aloituspäivämäärä osuu valitulle aikavälille, {'\n'}
          sen statistiikka lasketaan mukaan riippumatta siitä, {'\n'}
          milloin palautetta on annettu.
        </Alert>
      </Box>
      <RouterTabs variant="scrollable" scrollButtons="auto">
        <RouterTab
          label={t('courseSummary:myOrganisations')}
          icon={<BarChartOutlined />}
          to="/course-summary/v2/my-organisations"
        />
        <RouterTab
          label={t('common:university')}
          icon={
            <Box sx={{ width: '1.5rem', height: 'auto' }}>
              <img src={hyLogo} alt="HY" />
            </Box>
          }
          to="/course-summary/v2/university"
        />
      </RouterTabs>
      <Box mt="3rem">
        <Switch>
          <ProtectedRoute
            path="/course-summary/v2/my-organisations"
            component={MyOrganisations}
            hasAccess={
              // TODO: do not use HY specific special groups
              !inProduction ||
              user.isAdmin ||
              user?.specialGroup?.allProgrammes ||
              user?.specialGroup?.hyOne ||
              user?.specialGroup?.admin
            }
          />

          <ProtectedRoute
            path="/course-summary/v2/university"
            component={University}
            hasAccess={
              // TODO: do not use HY specific special groups
              !inProduction ||
              user.isAdmin ||
              user?.specialGroup?.allProgrammes ||
              user?.specialGroup?.hyOne ||
              user?.specialGroup?.admin
            }
          />
        </Switch>
      </Box>
    </>
  )
}

const Summary = () => (
  <SummaryContextProvider>
    <SummaryInContext />
  </SummaryContextProvider>
)

export default Summary
