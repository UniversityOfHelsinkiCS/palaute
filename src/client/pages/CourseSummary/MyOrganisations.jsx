import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { useSummaryContext } from './context'
import { useOrganisationSummaries } from './api'
import { useOrderedAndFilteredOrganisations } from './utils'
import OrganisationSummaryRow from './components/OrganisationRow'
import SummaryRowFilters from './components/SummaryRowFilters'

/**
 *
 */
const MyOrganisations = () => {
  const { dateRange } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries()

  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(organisations)

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <SummaryRowFilters filterType="my-organisation" />
      {isLoading ? (
        <LinearProgress />
      ) : (
        orderedAndFilteredOrganisations.map(organisation => (
          <OrganisationSummaryRow
            key={organisation.id}
            organisationId={organisation.id}
            organisation={organisation}
            startDate={dateRange.start}
            endDate={dateRange.end}
            alwaysOpen={orderedAndFilteredOrganisations.length === 1}
          />
        ))
      )}
    </Box>
  )
}

export default MyOrganisations
