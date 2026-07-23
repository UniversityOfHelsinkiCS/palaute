import { Alert, Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTeacherSummaries } from './api'
import SummaryRowFilters from './components/SummaryRowFilters'
import TeacherOrganisationRow from './components/TeacherOrganisationRow'
import TeacherOrganisationTable from './components/TeacherOrganisationTable'
import { useSummaryContext } from './context'

const MyCourses = ({ tableView = false }) => {
  const { t } = useTranslation()

  const { questions } = useSummaryContext()
  const { organisations, isLoading: isOrganisationsLoading } = useTeacherSummaries()

  const show = !isOrganisationsLoading && questions?.length && organisations && questions

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      <SummaryRowFilters hideColumns={tableView} />
      {show &&
        organisations.length > 0 &&
        organisations.map(organisation =>
          tableView ? (
            <TeacherOrganisationTable key={organisation.id} questions={questions} organisation={organisation} />
          ) : (
            <TeacherOrganisationRow key={organisation.id} questions={questions} organisation={organisation} />
          )
        )}
      {show && organisations.length === 0 && (
        <Box my="1rem" mx="2rem">
          <Alert severity="info">{t('courseSummary:noCourses')}</Alert>
        </Box>
      )}
    </Box>
  )
}

export default MyCourses
