import React from 'react'
import _ from 'lodash'
import useUniversitySurvey from '../../../hooks/useUniversitySurvey'
import { useSummaryContext } from './context'

export const useSummaryQuestions = () => {
  const { survey: universitySurvey, isLoading: isUniversitySurveyLoading } = useUniversitySurvey()

  const questions = universitySurvey?.questions || []

  const acualQuestions = questions.filter(q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD')

  return {
    questions: acualQuestions,
    isLoading: isUniversitySurveyLoading,
  }
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
