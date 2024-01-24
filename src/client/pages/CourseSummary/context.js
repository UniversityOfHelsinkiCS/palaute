import React from 'react'
import { useQuery } from 'react-query'
import { format, isValid } from 'date-fns'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import apiClient from '../../util/apiClient'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { getStudyYearRange } from '../../util/yearSemesterUtils'

const getSummarySortFunction = sortField => {
  switch (sortField) {
    case 'feedbackCount':
      return summary => summary.data.feedbackCount
    case 'feedbackPercentage':
      return summary => summary.data.feedbackCount / summary.data.studentCount
    case 'feedbackResponsePercentage':
      return summary => summary.data.feedbackResponsePercentage
    default:
      return summary => summary.data.result[sortField]?.mean
  }
}

const useInitialViewingMode = () => {
  const { authorizedUser } = useAuthorizedUser()
  const organisationAccess = authorizedUser?.organisationAccess ?? {}
  const organisationAccessCount = Object.keys(organisationAccess).length

  if (organisationAccessCount > 2) return 'flat'
  return 'tree'
}

const summaryContext = React.createContext({
  showSummariesWithNoFeedback: false,
  setShowSummariesWithNoFeedback: () => {},
  dateRange: getStudyYearRange(new Date()),
  setDateRange: () => {},
  option: 'year',
  setOption: () => {},
  sortBy: ['code', 'asc'],
  setSortBy: () => {},
  sortFunction: getSummarySortFunction('code'),
  questions: [],
  viewingMode: 'tree',
  setViewingMode: () => {},
  separateOrganisationId: null,
  setSeparateOrganisationId: () => {},
})

/**
 * Mess
 * @param {*} organisationCode
 * @returns
 */
const useSummaryQuestions = organisationCode => {
  const apiUrl = organisationCode ? `/surveys/organisation/${organisationCode}` : '/surveys/university'
  const queryFn = async () => {
    const { data } = await apiClient.get(apiUrl)
    return data
  }
  const { data } = useQuery(['survey', organisationCode], queryFn, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24,
  })
  const questions = data?.questions || []
  const acualQuestions = questions.filter(q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD')
  return acualQuestions
}

/**
 *
 * @param {*} param0
 * @returns
 */
export const SummaryContextProvider = ({ children, organisationCode }) => {
  const questions = useSummaryQuestions(organisationCode)

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

    return isValid(start) && isValid(end) ? { start, end } : getStudyYearRange(new Date())
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

  const sortFunction = React.useMemo(() => getSummarySortFunction(sortBy[0]), [sortBy[0]])

  // Viewing mode
  const initialViewingMode = useInitialViewingMode()
  const [viewingMode, setViewingMode] = React.useState(() => {
    const viewingMode = params.get('viewingMode')
    return viewingMode || initialViewingMode
  })

  const updateViewingModeQS = React.useCallback(viewingMode => {
    setViewingMode(viewingMode)
    params.set('viewingMode', viewingMode)
    setParams(params)
  })

  // Separate organisation id
  const [separateOrganisationId, setSeparateOrganisationId] = React.useState(() => {
    const separateOrganisationId = params.get('separateOrganisationId')
    return separateOrganisationId
  })

  const updateSeparateOrganisationIdQS = React.useCallback(separateOrganisationId => {
    setSeparateOrganisationId(separateOrganisationId)
    params.set('separateOrganisationId', separateOrganisationId)
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
      sortFunction,
      questions,
      viewingMode,
      setViewingMode: updateViewingModeQS,
      separateOrganisationId,
      setSeparateOrganisationId: updateSeparateOrganisationIdQS,
    }),
    [
      showSummariesWithNoFeedback,
      dateRange,
      option,
      sortBy[0],
      sortBy[1],
      questions,
      viewingMode,
      separateOrganisationId,
    ]
  )

  return <summaryContext.Provider value={value}>{children}</summaryContext.Provider>
}

export const useSummaryContext = () => React.useContext(summaryContext)
