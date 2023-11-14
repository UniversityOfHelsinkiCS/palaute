import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { useSummaryQuestions } from './utils'
import { SummaryContextProvider, useSummaryContext } from './context'

const OrganisationSummaryInContext = ({ organisationId }) => {
  const { dateRange } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })
  const { questions } = useSummaryQuestions()

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      {questions?.length && <SorterRow questions={questions} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <OrganisationSummaryRow
          key={organisation.id}
          loadClosed
          alwaysOpen
          organisationId={organisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      )}
    </Box>
  )
}

const ForOrganisation = ({ organisationId }) => (
  <SummaryContextProvider>
    <OrganisationSummaryInContext organisationId={organisationId} />
  </SummaryContextProvider>
)

export default ForOrganisation
