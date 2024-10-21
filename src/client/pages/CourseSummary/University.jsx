import React from 'react'
import { Box } from '@mui/material'
import { useSummaries } from './api'
import { UNIVERSITY_ROOT_ID } from '../../util/common'
import { useSummaryContext } from './context'
import OrganisationSummaryRow from './components/OrganisationRow'
import SummaryRowFilters from './components/SummaryRowFilters'

/**
 *
 */
const University = () => {
  const { dateRange } = useSummaryContext()

  const { organisation: universityOrganisation } = useSummaries({
    entityId: UNIVERSITY_ROOT_ID,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <SummaryRowFilters filterType="university" />
      <OrganisationSummaryRow
        organisationId={UNIVERSITY_ROOT_ID}
        organisation={universityOrganisation}
        alwaysOpen
        startDate={dateRange.start}
        endDate={dateRange.end}
      />
    </Box>
  )
}

export default University
