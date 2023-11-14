import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'

const OrganisationSummaryInContext = ({ organisation: initialOrganisation }) => {
  const { dateRange, questions } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: initialOrganisation.id,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      {questions?.length && <SorterRow questions={questions} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <OrganisationSummaryRow
          loadClosed
          alwaysOpen
          organisationId={initialOrganisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      )}
    </Box>
  )
}

const ForOrganisation = ({ organisation }) => (
  <SummaryContextProvider>
    <OrganisationSummaryInContext organisation={organisation} />
  </SummaryContextProvider>
)

export default ForOrganisation
