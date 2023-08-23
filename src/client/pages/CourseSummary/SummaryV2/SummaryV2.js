import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { subDays } from 'date-fns'
import { useSnackbar } from 'notistack'
import OrganisationSummaryRow from './SummaryRow'
import { updateSummaries, useSummaries } from './api'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import LinkButton from '../../../components/common/LinkButton'

const SummaryV2 = () => {
  const { enqueueSnackbar } = useSnackbar()
  const startDate = new Date('2023-01-01')
  const endDate = subDays(new Date('2023-08-01'), 1)
  const entityId = 'hy-university-root-id'

  const { organisation, questions, isLoading } = useSummaries({
    entityId,
    startDate,
    endDate,
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
      {isLoading ? (
        <LoadingProgress />
      ) : (
        <OrganisationSummaryRow
          entityId={entityId}
          organisation={organisation}
          questions={questions}
          startDate={startDate}
          endDate={endDate}
          isInitiallyOpen
        />
      )}
    </Box>
  )
}

export default SummaryV2
