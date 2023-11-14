import React from 'react'
import { OrganisationSummaryRow, SorterRow } from './SummaryRow'
import { useSummaries } from './api'
import { UNIVERSITY_ROOT_ID } from '../../../util/common'
import { useSummaryContext } from './context'

/**
 *
 */
const University = () => {
  const { dateRange, questions } = useSummaryContext()

  const { organisation: universityOrganisation } = useSummaries({
    entityId: UNIVERSITY_ROOT_ID,
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

  return (
    <>
      {questions?.length && <SorterRow questions={questions} />}
      <OrganisationSummaryRow
        organisationId={UNIVERSITY_ROOT_ID}
        organisation={universityOrganisation}
        alwaysOpen
        startDate={dateRange.start}
        endDate={dateRange.end}
      />
    </>
  )
}

export default University
