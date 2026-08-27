import { Box, Divider, LinearProgress, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useOrganisationSummaries, usePinnedOrganisations } from './api'
import NoSummaryAlert from './components/NoSummaryAlert'
import OrganisationSummaryRow from './components/OrganisationRow'
import OrganisationSummaryTableView from './components/OrganisationSummaryTableView'
import SummaryRowFilters from './components/SummaryRowFilters'
import { useSummaryContext } from './context'
import { useOrderedAndFilteredOrganisations } from './utils'

const MyOrganisations = ({ tableView = false }) => {
  const { t } = useTranslation()
  const { dateRange } = useSummaryContext()
  const { organisations, isLoading } = useOrganisationSummaries()
  const { pinnedOrganisations } = usePinnedOrganisations()

  const topLevelById = useMemo(() => new Map(organisations.map(o => [o.id, o])), [organisations])

  const pinnedIds = useMemo(() => new Set(pinnedOrganisations.map(o => o.id)), [pinnedOrganisations])

  // For pinned top-level orgs, use the richer object (with inline summary + children) from
  // useOrganisationSummaries so we avoid a redundant lazy-load. For pinned nested orgs that
  // aren't in the top-level list, use the slim {id,code,name} record and let the row lazy-load.
  const pinnedRows = useMemo(
    () => pinnedOrganisations.map(p => topLevelById.get(p.id) ?? p),
    [pinnedOrganisations, topLevelById]
  )

  const orderedTopLevel = useOrderedAndFilteredOrganisations(organisations)
  const rest = useMemo(() => orderedTopLevel.filter(o => !pinnedIds.has(o.id)), [orderedTopLevel, pinnedIds])

  if (tableView) {
    return <OrganisationSummaryTableView pinnedOrgs={pinnedRows} otherOrgs={rest} dateRange={dateRange} />
  } else {
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <SummaryRowFilters filterType="my-organisation" hideColumns={items.length === 0} />
        </Box>
        {isLoading && <LinearProgress />}
        {!isLoading && (items.length === 0 ? <NoSummaryAlert alertText={t('courseSummary:noSummaryInfo')} /> : items)}
      </Box>
    )
  }
}

export default MyOrganisations
