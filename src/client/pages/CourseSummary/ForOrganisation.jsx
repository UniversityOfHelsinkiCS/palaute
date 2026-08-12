import { Box, LinearProgress, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../components/common/NorButton'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import { useSummaries } from './api'
import ExtraOrganisationModeSelector from './components/ExtraOrganisationModeSelector'
import OrganisationSummaryRow from './components/OrganisationRow'
import { OrganisationTable } from './components/OrganisationSummaryTableView'
import SorterRowWithFilters from './components/SorterRow'
import SummaryScrollContainer from './components/SummaryScrollContainer'
import { SummaryContextProvider, useSummaryContext } from './context'
import GenerateReport from './GenerateReport'

const OrganisationSummaryInContext = ({ organisation: initialOrganisation }) => {
  const { t } = useTranslation()
  const [tableView, setTableView] = useLocalStorageState('tableView', false)
  const { authorizedUser: user } = useAuthorizedUser()

  const { dateRange, tagId, questions } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: initialOrganisation.id,
    enabled: true,
    tagId,
  })

  return (
    <SummaryScrollContainer>
      <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem" pl="0.5rem">
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {user.isAdmin && (
            <NorButton color="secondary" onClick={() => setTableView(!tableView)} sx={{ p: 1 }}>
              {tableView ? t('courseSummary:treeView') : t('courseSummary:tableView')}
            </NorButton>
          )}
          <GenerateReport organisationId={initialOrganisation.id} />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', minHeight: '70px' }}>
          {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
          <SorterRowWithFilters hideColumns={tableView || !organisation} />
        </Box>
        {isLoading && <LinearProgress />}
        {!organisation && <Alert severity="info">{t('courseSummary:noSummaryInfo')}</Alert>}
        {!isLoading &&
          Boolean(organisation) &&
          (tableView ? (
            <OrganisationTable
              organisation={organisation}
              questions={questions}
              dateRange={dateRange}
              showActions={false}
            />
          ) : (
            <OrganisationSummaryRow
              alwaysOpen
              organisationId={initialOrganisation.id}
              organisation={organisation}
              startDate={dateRange.start}
              endDate={dateRange.end}
              noPins={true}
            />
          ))}
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
