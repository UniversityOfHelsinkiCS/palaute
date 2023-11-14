import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { useSummaryQuestions } from './utils'
import { SummaryContextProvider, useSummaryContext } from './context'
import { YearSemesterSelector } from '../../../components/common/YearSemesterSelector'

const OrganisationSummaryInContext = ({ organisationId }) => {
  const { dateRange, setDateRange, option, setOption } = useSummaryContext()
  const [, startTransition] = React.useTransition()

  const handleChangeTimeRange = nextDateRange => {
    startTransition(() => {
      setDateRange(nextDateRange)
    })
  }

  const { organisation, isLoading } = useSummaries({
    entityId: organisationId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })
  const { questions } = useSummaryQuestions()

  const filterComponent = (
    <YearSemesterSelector
      value={dateRange ?? { start: new Date(), end: new Date() }}
      onChange={handleChangeTimeRange}
      option={option}
      setOption={setOption}
    />
  )

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.3rem">
      {questions?.length && <SorterRow questions={questions} filterComponent={filterComponent} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <OrganisationSummaryRow
          key={organisation.id}
          loadClosed
          alwaysOpen
          organisationId={organisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      )}
    </Box>
  )
}

const ForOrganisation = ({ organisationId }) => (
  <SummaryContextProvider>
    <OrganisationSummaryInContext organisationId={organisationId} />
  </SummaryContextProvider>
)

export default ForOrganisation
