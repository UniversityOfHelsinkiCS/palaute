import React from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import OrganisationSummaryRow from './SummaryRow'
import { updateSummaries, useSummaries } from './api'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import LinkButton from '../../../components/common/LinkButton'
import { YearSemesterSelector } from '../../../components/common/YearSemesterSelector'
import useHistoryState from '../../../hooks/useHistoryState'

const SummaryV2 = () => {
  const { enqueueSnackbar } = useSnackbar()
  const startDate = new Date('2023-01-01')
  const endDate = new Date('2024-01-01')
  const entityId = 'hy-university-root-id'

  const [dateRange, setDateRange] = useHistoryState('summary-v2-time-range', { start: startDate, end: endDate })
  const [option, setOption] = React.useState('year')

  const { organisation, questions, isLoading } = useSummaries({
    entityId,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

  const handleUpdateData = async () => {
    const duration = await updateSummaries()
    if (duration) enqueueSnackbar(`Valmis, kesti ${(duration / 1000).toFixed()} sekuntia`)
  }

  return (
    <Box>
      <Box mb={6} px={1}>
        <Box display="flex" gap="1rem" alignItems="end">
          <Typography variant="h4" component="h1">
            MINTUfied kurssiyhteenveto (ALPHA)
          </Typography>
          <LinkButton to="/course-summary" title="unmintufy" />
        </Box>
        <Typography variant="subtitle1">Vain admineille</Typography>
        <Button variant="text" onClick={handleUpdateData}>
          Aja datanpäivitys
        </Button>
      </Box>
      <Box display="flex" pb="2rem" justifyContent="space-between" alignItems="end">
        <YearSemesterSelector
          value={dateRange ?? { start: new Date(), end: new Date() }}
          onChange={setDateRange}
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
      {isLoading ? (
        <LoadingProgress />
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {organisation ? (
            <OrganisationSummaryRow
              entityId={entityId}
              organisation={organisation}
              questions={questions}
              isInitiallyOpen
              startDate={dateRange.start}
              endDate={dateRange.end}
            />
          ) : (
            <div>Jaahas, mitään ei löydy. Data pitää varmaan päivittää</div>
          )}
        </>
      )}
    </Box>
  )
}

export default SummaryV2
