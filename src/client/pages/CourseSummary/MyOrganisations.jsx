import { Box, Divider, LinearProgress, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useOrganisationSummaries, usePinnedOrganisations } from './api'
import OrganisationSummaryRow from './components/OrganisationRow'
import SummaryRowFilters from './components/SummaryRowFilters'
import { useSummaryContext } from './context'
import { useOrderedAndFilteredOrganisations } from './utils'

const MyOrganisations = () => {
  const { t } = useTranslation()
  const { dateRange } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries()
  const { pinnedOrganisations } = usePinnedOrganisations()

  const topLevelById = React.useMemo(() => new Map(organisations.map(o => [o.id, o])), [organisations])

  const pinnedIds = React.useMemo(() => new Set(pinnedOrganisations.map(o => o.id)), [pinnedOrganisations])

  // For pinned top-level orgs, use the richer object (with inline summary + children) from
  // useOrganisationSummaries so we avoid a redundant lazy-load. For pinned nested orgs that
  // aren't in the top-level list, use the slim {id,code,name} record and let the row lazy-load.
  const pinnedRows = React.useMemo(
    () => pinnedOrganisations.map(p => topLevelById.get(p.id) ?? p),
    [pinnedOrganisations, topLevelById]
  )

  const orderedTopLevel = useOrderedAndFilteredOrganisations(organisations)
  const rest = React.useMemo(() => orderedTopLevel.filter(o => !pinnedIds.has(o.id)), [orderedTopLevel, pinnedIds])

  const showRootPinButton = organisations.length > 1

  const items = []
  if (pinnedRows.length > 0) {
    items.push(
      <Typography key="pinned-header" variant="subtitle2" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
        {t('courseSummary:pinnedOrganisations')}
      </Typography>
    )
    pinnedRows.forEach(organisation =>
      items.push(
        <OrganisationSummaryRow
          key={organisation.id}
          organisationId={organisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
          alwaysOpen={pinnedRows.length === 1 && rest.length === 0}
        />
      )
    )
    items.push(<Divider key="pinned-divider" sx={{ my: 0.5 }} />)
  }
  rest.forEach(organisation =>
    items.push(
      <OrganisationSummaryRow
        key={organisation.id}
        organisationId={organisation.id}
        organisation={organisation}
        startDate={dateRange.start}
        endDate={dateRange.end}
        alwaysOpen={organisations.length === 1}
        showPinButton={showRootPinButton}
      />
    )
  )

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <SummaryRowFilters filterType="my-organisation" />
      {isLoading ? <LinearProgress /> : items}
    </Box>
  )
}

export default MyOrganisations
