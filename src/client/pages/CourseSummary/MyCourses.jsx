import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { AccessibleLoadingBar } from '../../components/common/AccessibleLoadingBar'
import { useTeacherSummaries } from './api'
import NoSummaryAlert from './components/NoSummaryAlert'
import { OrganisationTable } from './components/OrganisationSummaryTableView'
import SummaryRowFilters from './components/SummaryRowFilters'
import TeacherOrganisationRow from './components/TeacherOrganisationRow'
import { useSummaryContext } from './context'

const MyCourses = ({ tableView = false }) => {
  const { t } = useTranslation()

  const { questions, dateRange } = useSummaryContext()
  const { organisations, isLoading: isOrganisationsLoading } = useTeacherSummaries()

  const show = !isOrganisationsLoading && questions?.length && organisations && questions
  const noSummary = show && organisations?.length === 0

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <SummaryRowFilters hideColumns={tableView || noSummary} showSortSelector={tableView && !noSummary} />
      </Box>
      {isOrganisationsLoading && <AccessibleLoadingBar />}
      {show &&
        organisations?.length > 0 &&
        organisations.map(organisation =>
          tableView ? (
            <OrganisationTable
              key={organisation.id}
              organisation={organisation}
              questions={questions}
              dateRange={dateRange}
              showRootPin={false}
              courseUnitsOnly
            />
          ) : (
            <TeacherOrganisationRow
              key={organisation.id}
              questions={questions}
              organisation={organisation}
              dateRange={dateRange}
            />
          )
        )}
      {noSummary && <NoSummaryAlert alertText={t('courseSummary:noCourses')} />}
    </Box>
  )
}

export default MyCourses
