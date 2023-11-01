import React from 'react'
import { Alert, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'
import { useTeacherSummaries } from './api'
import { SorterRow, TeacherOrganisationSummaryRow } from './SummaryRow'
import { useSummaryQuestions } from './utils'

/**
 *
 */
const MyCourses = () => {
  const { t } = useTranslation()
  const { dateRange } = useSummaryContext()
  const { organisations, isLoading: isOrganisationsLoading } = useTeacherSummaries({
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })
  const { questions, isLoading: isQuestionsLoading } = useSummaryQuestions()

  const show = !isOrganisationsLoading && !isQuestionsLoading && organisations && questions

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.4rem">
      {show && organisations.length > 0 && (
        <>
          <SorterRow />
          {organisations.map(organisation => (
            <TeacherOrganisationSummaryRow key={organisation.id} questions={questions} organisation={organisation} />
          ))}
        </>
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
