import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, LinearProgress, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import { Reorder, Segment } from '@mui/icons-material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaryContext } from './context'
import { useOrganisationSummaries } from './api'
import { useOrderedAndFilteredOrganisations } from './utils'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import SeparateOrganisationModeSelector from './SeparateOrganisationModeSelector'

const ViewingModeSelector = ({ viewingMode, setViewingMode }) => {
  const { t } = useTranslation()
  const handleChange = (_ev, value) => {
    if (!value) return
    setViewingMode(value)
  }

  return (
    <ToggleButtonGroup
      exclusive
      value={viewingMode}
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{ height: '40px' }}
    >
      <ToggleButton value="flat">
        <Tooltip title={t('courseSummary:flatView')}>
          <Reorder fontSize="medium" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="tree">
        <Tooltip title={t('courseSummary:treeView')}>
          <Segment fontSize="medium" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

/**
 *
 */
const MyOrganisations = () => {
  const { dateRange, viewingMode, setViewingMode } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries()

  const orderedAndFilteredOrganisations = useOrderedAndFilteredOrganisations(organisations)

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <ViewingModeSelector viewingMode={viewingMode} setViewingMode={setViewingMode} />
      {OPEN_UNIVERSITY_ORG_ID && <SeparateOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
      <SorterRow />
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
