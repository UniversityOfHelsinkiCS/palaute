import React from 'react'
import { LinearProgress } from '@mui/material'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { SummaryContextProvider, useSummaryContext } from './context'
import SummaryScrollContainer from './SummaryScrollContainer'

const OrganisationSummaryInContext = ({ organisation: initialOrganisation }) => {
  const { dateRange, questions } = useSummaryContext()

  const { organisation, isLoading } = useSummaries({
    entityId: initialOrganisation.id,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: true,
  })

  return (
    <SummaryScrollContainer>
      {questions?.length && <SorterRow questions={questions} />}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <OrganisationSummaryRow
          loadClosed
          alwaysOpen
          organisationId={initialOrganisation.id}
          organisation={organisation}
          startDate={dateRange.start}
          endDate={dateRange.end}
        />
      )}
    </SummaryScrollContainer>
  )
}

const ForOrganisation = ({ organisation }) => (
  <SummaryContextProvider organisationCode={organisation.code}>
    <OrganisationSummaryInContext organisation={organisation} />
  </SummaryContextProvider>
)

export default ForOrganisation
