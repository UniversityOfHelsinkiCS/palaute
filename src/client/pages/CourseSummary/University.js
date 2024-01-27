import React from 'react'
import { Box } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { OPEN_UNIVERSITY_ORG_ID, UNIVERSITY_ROOT_ID } from '../../util/common'
import { useSummaryContext } from './context'
import ExtraOrganisationModeSelector from './ExtraOrganisationModeSelector'

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
      {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
      <SorterRow />
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
