import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import ExtraOrganisationModeSelector from './components/ExtraOrganisationModeSelector'
import SorterRowWithFilters from './components/SorterRow'
import OrganisationSummaryRow from './components/OrganisationRow'
import GenerateReport from './GenerateReport'

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
        <GenerateReport organisationId={initialOrganisation.id} />
        <Box sx={{ mt: 1 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', minHeight: '70px' }}>
          {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
          <SorterRowWithFilters />
        </Box>
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
