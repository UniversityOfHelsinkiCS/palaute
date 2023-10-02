import React from 'react'
import { format, isValid } from 'date-fns'
import useURLSearchParams from '../../../hooks/useURLSearchParams'

const summaryContext = React.createContext({
  showSummariesWithNoFeedback: false,
  setShowSummariesWithNoFeedback: () => {},
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2024-01-01'),
  },
  setDateRange: () => {},
  option: 'year',
  setOption: () => {},
})

export const SummaryContextProvider = ({ children }) => {
  const [params, setParams] = useURLSearchParams()

  const [showSummariesWithNoFeedback, setShowSummariesWithNoFeedback] = React.useState(() => {
    const showSummariesWithNoFeedbackParam = params.get('showSummariesWithNoFeedback')
    return showSummariesWithNoFeedbackParam ? showSummariesWithNoFeedbackParam === 'true' : false
  })

  const updateShowSummariesWithNoFeedbackQS = React.useCallback(showSummariesWithNoFeedback => {
    setShowSummariesWithNoFeedback(showSummariesWithNoFeedback)
    params.set('showSummariesWithNoFeedback', showSummariesWithNoFeedback)
    setParams(params)
  })

  const [dateRange, setDateRange] = React.useState(() => {
    // Converting to string is important, params.get may return 0 which would take us to the 70s
    const start = new Date(String(params.get('startDate')))
    const end = new Date(String(params.get('endDate')))

    return isValid(start) && isValid(end)
      ? { start, end }
      : {
          start: new Date('2023-01-01'),
          end: new Date('2024-01-01'),
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

  const [option, setOption] = React.useState(() => {
    const option = params.get('option')
    return option || 'year'
  })

  const updateOptionQS = React.useCallback(option => {
    setOption(option)
    params.set('option', option)
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
    }),
    [showSummariesWithNoFeedback, dateRange, option]
  )

  return <summaryContext.Provider value={value}>{children}</summaryContext.Provider>
}

export const useSummaryContext = () => React.useContext(summaryContext)
