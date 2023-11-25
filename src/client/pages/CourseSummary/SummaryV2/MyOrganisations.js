import React from 'react'
import { Box, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Reorder, Segment } from '@mui/icons-material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaryContext } from './context'
import { useOrganisationSummaries } from './api'
import { useOrderedAndFilteredOrganisations } from './utils'

const ViewingModeSelector = ({ viewingMode, setViewingMode }) => {
  const handleChange = (_ev, value) => {
    if (!value) return
    setViewingMode(value)
  }

  return (
    <ToggleButtonGroup exclusive value={viewingMode} onChange={handleChange} color="primary">
      <ToggleButton value="flat">
        <Reorder />
      </ToggleButton>
      <ToggleButton value="tree">
        <Segment />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

/**
 *
 */
const MyOrganisations = () => {
  const { dateRange, questions, viewingMode, setViewingMode } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries({
    startDate: dateRange.start,
    endDate: dateRange.end,
    viewingMode,
    enabled: true,
  })

  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(organisations)

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <ViewingModeSelector viewingMode={viewingMode} setViewingMode={setViewingMode} />
      {questions?.length && <SorterRow questions={questions} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        orderedAndFilteredOrganisations.map(organisation => (
          <OrganisationSummaryRow
            key={organisation.id}
            loadClosed
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
