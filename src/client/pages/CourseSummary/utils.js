import React from 'react'
import _ from 'lodash'
import { isBefore, parseISO } from 'date-fns'
import { useSummaryContext } from './context'

export const getFeedbackResponseGiven = feedbackTarget => {
  if (isBefore(Date.now(), parseISO(feedbackTarget.closesAt))) return 'OPEN'

  return feedbackTarget.feedbackResponse ? 'GIVEN' : 'NONE'
}

export const useOrderedAndFilteredOrganisations = organisations => {
  const { showSummariesWithNoFeedback, sortBy, sortFunction } = useSummaryContext()
  const filteredAndOrderedOrganisations = React.useMemo(
    () =>
      !organisations
        ? []
        : _.orderBy(
            showSummariesWithNoFeedback ? organisations : organisations.filter(org => !!org.summary),
            org => sortFunction(org.summary),
            sortBy[1]
          ),
    [showSummariesWithNoFeedback, organisations, sortBy[0], sortBy[1]]
  )

  return filteredAndOrderedOrganisations
}
