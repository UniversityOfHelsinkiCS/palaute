import { useState, useMemo } from 'react'
import { isBefore, parseISO } from 'date-fns'
import { orderBy } from 'lodash'
import { useHistory } from 'react-router-dom'

import useOrganisationSummaries from '../../hooks/useOrganisationSummaries'

const courseCodeMatches = (courseCode, keyword) => {
  if (!keyword) {
    return true
  }

  const normalizedCourseCode = courseCode.toLowerCase()

  return normalizedCourseCode.includes(keyword)
}

export const getFeedbackResponseGiven = (feedbackResponseGiven, closesAt) => {
  if (isBefore(Date.now(), parseISO(closesAt))) return 'OPEN'

  return feedbackResponseGiven ? 'GIVEN' : 'NONE'
}

const filterByCourseCode = (organisations, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return organisations
  }

  const organisationsWithFilteredCourseUnits = organisations.map(
    ({ courseUnits, ...org }) => ({
      courseUnits: (courseUnits ?? []).filter(({ courseCode }) =>
        courseCodeMatches(courseCode, normalizedKeyword),
      ),
      ...org,
    }),
  )

  return organisationsWithFilteredCourseUnits.filter(
    ({ courseUnits }) => courseUnits.length > 0,
  )
}

export const hasWriteAccess = (organisationId, organisationAccess) =>
  Boolean(
    (organisationAccess ?? []).find(({ id }) => id === organisationId)?.access
      .write,
  )

const getInitialOpenAccordions = (organisations, history) => {
  const historyOpenAccordions = history.location.state?.openAccordions

  if (historyOpenAccordions) {
    return historyOpenAccordions
  }

  if (organisations.length < 3) {
    return organisations.map(({ id }) => id)
  }

  return []
}

export const ORDER_BY_OPTIONS = [
  {
    value: 'CODE_ASC',
    label: 'courseSummary:orderByCodeAsc',
  },
  {
    value: 'FEEDBACK_COUNT_ASC',
    label: 'courseSummary:orderByFeedbackCountAsc',
  },
  {
    value: 'FEEDBACK_COUNT_DESC',
    label: 'courseSummary:orderByFeedbackCountDesc',
  },
]

const ARGS_BY_ORDER_BY = {
  FEEDBACK_COUNT_ASC: {
    organisations: [['feedbackCount'], ['asc']],
    courseUnits: [['feedbackCount'], ['asc']],
  },
  FEEDBACK_COUNT_DESC: {
    organisations: [['feedbackCount'], ['desc']],
    courseUnits: [['feedbackCount'], ['desc']],
  },
}

const orderByCriteria = (organisations, orderByCriteria) => {
  const orderByArgs = ARGS_BY_ORDER_BY[orderByCriteria]

  return orderByArgs
    ? orderBy(
        organisations.map((organisation) => ({
          ...organisation,
          courseUnits: orderBy(
            organisation.courseUnits,
            ...orderByArgs.courseUnits,
          ),
        })),
        ...orderByArgs.organisations,
      )
    : organisations
}

export const useHistoryState = (key, initialValue) => {
  const history = useHistory()

  const historyState = history.location.state ?? {}

  const replaceHistoryState = (update) => {
    history.replace({
      state: { ...historyState, ...update },
    })
  }

  const [state, setState] = useState(historyState[key] ?? initialValue)

  const handleSetState = (nextState) => {
    setState(nextState)
    replaceHistoryState({ [key]: nextState })
  }

  return [state, handleSetState]
}

export const useOpenAccordions = (organisations) => {
  const history = useHistory()

  const historyState = history.location.state ?? {}

  const replaceHistoryState = (update) => {
    history.replace({
      state: { ...historyState, ...update },
    })
  }

  const openAccordions = getInitialOpenAccordions(organisations, history)

  const toggleAccordion = (id) => {
    let nextOpenAccordions = openAccordions

    if (openAccordions.includes(id)) {
      nextOpenAccordions = openAccordions.filter((a) => a !== id)
    } else {
      nextOpenAccordions = openAccordions.concat(id)
    }

    replaceHistoryState({ openAccordions: nextOpenAccordions })
  }

  return { openAccordions, toggleAccordion }
}

export const useAggregatedOrganisationSummaries = ({
  orderBy,
  keyword,
  includeOpenUniCourseUnits,
}) => {
  const { organisationSummaries, ...rest } = useOrganisationSummaries({
    includeOpenUniCourseUnits,
    keepPreviousData: true,
  })

  const filteredOrganisations = useMemo(
    () =>
      filterByCourseCode(organisationSummaries?.organisations ?? [], keyword),
    [organisationSummaries?.organisations, keyword],
  )

  const sortedOrganisations = useMemo(
    () => orderByCriteria(filteredOrganisations, orderBy),
    [filteredOrganisations, orderBy],
  )

  return {
    organisationSummaries,
    aggregatedOrganisations: sortedOrganisations,
    ...rest,
  }
}
