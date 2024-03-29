import React from 'react'
import { Alert, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'
import { useTeacherSummaries } from './api'
import TeacherOrganisationRow from './components/TeacherOrganisationRow'
import { OPEN_UNIVERSITY_ORG_ID } from '../../util/common'
import ExtraOrganisationModeSelector from './components/ExtraOrganisationModeSelector'
import SorterRowWithFilters from './components/SorterRow'

/**
 *
 */
const MyCourses = () => {
  const { t } = useTranslation()
  const { questions } = useSummaryContext()
  const { organisations, isLoading: isOrganisationsLoading } = useTeacherSummaries()

  const show = !isOrganisationsLoading && questions?.length && organisations && questions

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      {OPEN_UNIVERSITY_ORG_ID && <ExtraOrganisationModeSelector organisationId={OPEN_UNIVERSITY_ORG_ID} />}
      <SorterRowWithFilters />
      {show &&
        organisations.length > 0 &&
        organisations.map(organisation => (
          <TeacherOrganisationRow key={organisation.id} questions={questions} organisation={organisation} />
        ))}
      {show && organisations.length === 0 && (
        <Box my="1rem" mx="2rem">
          <Alert severity="info">{t('courseSummary:noCourses')}</Alert>
        </Box>
      )}
    </Box>
  )
}

export default MyCourses
