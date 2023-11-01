import React from 'react'
import { format, isValid } from 'date-fns'
import useURLSearchParams from '../../../hooks/useURLSearchParams'

const summaryContext = React.createContext({
  showSummariesWithNoFeedback: false,
  setShowSummariesWithNoFeedback: () => {},
  dateRange: {
    start: null,
    end: null,
  },
  setDateRange: () => {},
  option: 'year',
  setOption: () => {},
  sortBy: ['code', 'asc'],
  setSortBy: () => {},
})

export const SummaryContextProvider = ({ children }) => {
  const [params, setParams] = useURLSearchParams()

  // Whether to show summaries with no feedback

  const [showSummariesWithNoFeedback, setShowSummariesWithNoFeedback] = React.useState(() => {
    const showSummariesWithNoFeedbackParam = params.get('showSummariesWithNoFeedback')
    return showSummariesWithNoFeedbackParam ? showSummariesWithNoFeedbackParam === 'true' : false
  })

  const updateShowSummariesWithNoFeedbackQS = React.useCallback(showSummariesWithNoFeedback => {
    setShowSummariesWithNoFeedback(showSummariesWithNoFeedback)
    params.set('showSummariesWithNoFeedback', showSummariesWithNoFeedback)
    setParams(params)
  })

  // Date range

  const [dateRange, setDateRange] = React.useState(() => {
    // Converting to string is important, params.get may return 0 which would take us to the 70s
    const start = new Date(String(params.get('startDate')))
    const end = new Date(String(params.get('endDate')))

    return isValid(start) && isValid(end)
      ? { start, end }
      : {
          start: null,
          end: null,
        }
  })

  const updateDateRangeQS = React.useCallback(dateRange => {
    setDateRange(dateRange)
    if (isValid(dateRange.start) && isValid(dateRange.end)) {
      params.set('startDate', format(dateRange.start, 'yyyy-MM-dd'))
      params.set('endDate', format(dateRange.end, 'yyyy-MM-dd'))
      setParams(params)
    }
  })

  // Option: year or semester

  const [option, setOption] = React.useState(() => {
    const option = params.get('option')
    return option || 'year'
  })

  const updateOptionQS = React.useCallback(option => {
    setOption(option)
    params.set('option', option)
    setParams(params)
  })

  // Sort by

  const [sortBy, setSortBy] = React.useState(() => {
    const sortByField = params.get('sortBy')
    const order = params.get('order')
    return sortByField && order ? [sortByField, order] : ['code', 'asc']
  })

  const updateSortByQS = React.useCallback(sortBy => {
    setSortBy(sortBy)
    params.set('sortBy', sortBy[0])
    params.set('order', sortBy[1])
    setParams(params)
  })

  const value = React.useMemo(
    () => ({
      showSummariesWithNoFeedback,
      setShowSummariesWithNoFeedback: updateShowSummariesWithNoFeedbackQS,
      dateRange,
      setDateRange: updateDateRangeQS,
      option,
      setOption: updateOptionQS,
      sortBy,
      setSortBy: updateSortByQS,
    }),
    [showSummariesWithNoFeedback, dateRange, option, sortBy[0], sortBy[1]]
  )

  return <summaryContext.Provider value={value}>{children}</summaryContext.Provider>
}

export const useSummaryContext = () => React.useContext(summaryContext)
