import React from 'react'
import useHistoryState from '../../../hooks/useHistoryState'

const summaryContext = React.createContext({
  showSummariesWithNoFeedback: false,
  setShowSummariesWithNoFeedback: () => {},
  dateRange: {
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
  },
  setDateRange: () => {},
  option: 'year',
  setOption: () => {},
})

export const SummaryContextProvider = ({ children }) => {
  const [showSummariesWithNoFeedback, setShowSummariesWithNoFeedback] = React.useState(false)
  const [dateRange, setDateRange] = useHistoryState('summary-v2-time-range', {
    start: new Date('2023-01-01'),
    end: new Date('2024-01-01'),
  })
  const [option, setOption] = React.useState('year')

  const value = React.useMemo(
    () => ({
      showSummariesWithNoFeedback,
      setShowSummariesWithNoFeedback,
      dateRange,
      setDateRange,
      option,
      setOption,
    }),
    [showSummariesWithNoFeedback, dateRange, option]
  )

  return <summaryContext.Provider value={value}>{children}</summaryContext.Provider>
}

export const useSummaryContext = () => React.useContext(summaryContext)
