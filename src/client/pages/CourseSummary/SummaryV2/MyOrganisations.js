import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaryContext } from './context'
import { useOrganisationSummaries } from './api'
import { useOrderedAndFilteredOrganisations } from './utils'

/**
 *
 */
const MyOrganisations = () => {
  const { dateRange, questions } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries({
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })

  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(organisations)

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      {questions?.length && <SorterRow questions={questions} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        orderedAndFilteredOrganisations.map(organisation => (
          <OrganisationSummaryRow
            key={organisation.id}
            loadClosed
            alwaysOpen={organisations.length === 1}
            organisationId={organisation.id}
            organisation={organisation}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        ))
      )}
    </Box>
  )
}

export default MyOrganisations
