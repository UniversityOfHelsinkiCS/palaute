import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'
import SummaryScrollContainer from './SummaryScrollContainer'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import SeparateOrganisationModeSelector from './SeparateOrganisationModeSelector'

const OrganisationSummaryInContext = ({ organisation: initialOrganisation }) => {
  const { dateRange, tagId } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: initialOrganisation.id,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
    tagId,
  })

  return (
    <SummaryScrollContainer>
      <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
        {OPEN_UNIVERSITY_ORG_ID && <SeparateOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
        <SorterRow />
        {isLoading ? (
          <LinearProgress />
        ) : (
          <OrganisationSummaryRow
            alwaysOpen
            organisationId={initialOrganisation.id}
            organisation={organisation}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        )}
      </Box>
    </SummaryScrollContainer>
  )
}

const ForOrganisation = ({ organisation }) => (
  <SummaryContextProvider organisationCode={organisation.code}>
    <OrganisationSummaryInContext organisation={organisation} />
  </SummaryContextProvider>
)

export default ForOrganisation
