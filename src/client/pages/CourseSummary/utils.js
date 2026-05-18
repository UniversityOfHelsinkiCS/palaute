import React from 'react'
import { orderBy } from 'lodash-es'
import { useSummaryContext } from './context'

export const useOrderedAndFilteredOrganisations = organisations => {
  const { showSummariesWithNoFeedback, sortBy, sortFunction } = useSummaryContext()
  const filteredAndOrderedOrganisations = React.useMemo(
    () =>
      !organisations
        ? []
        : orderBy(
            showSummariesWithNoFeedback ? organisations : organisations.filter(org => !!org.summary),
            [org => sortFunction(org.summary), org => org?.code],
            [sortBy[1], 'asc']
          ),
    [showSummariesWithNoFeedback, organisations, sortBy[0], sortBy[1]]
  )

  return filteredAndOrderedOrganisations
}
