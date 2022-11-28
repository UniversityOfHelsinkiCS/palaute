import { useMemo } from 'react'
import { isBefore, parseISO } from 'date-fns'
import { orderBy, sortBy } from 'lodash'
import { useHistory } from 'react-router-dom'

import useOrganisationSummaries from '../../hooks/useOrganisationSummaries'
import { data } from '../../../config/data'

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

const isNumber = (value) => !Number.isNaN(parseInt(value, 10))

export const normalizeOrganisationCode = (r) => {
  if (r.startsWith('T')) {
    return r.replace('T', '7')
  }
  if (!r.includes('_')) {
    return r
  }

  const [left, right] = r.split('_')
  const prefix = [...left].filter(isNumber).join('')
  const suffix = `${left[0]}${right}`
  const providercode = `${prefix}0-${suffix}`
  return providercode
}

export const getFacultyAccess = (organisationAccess) => {
  const organisationCodes = organisationAccess.map(({ code }) => code)
  const faculties = data.map((data) => ({
    ...data,
    programmes: data.programmes.map((programme) => ({
      ...programme,
      key: normalizeOrganisationCode(programme.key),
    })),
  }))

  const facultyAccess = []
  faculties.forEach((faculty) => {
    const programmeCodes = faculty.programmes.map(({ key }) => key)
    const hasAccess = organisationCodes.some((code) =>
      programmeCodes.includes(code),
    )

    if (hasAccess) facultyAccess.push(faculty)
  })

  return facultyAccess
}

const filterByFaculty = (organisations, facultyCode) => {
  if (!facultyCode) return organisations

  const facultyProgrammeCodes = data
    .find((faculty) => faculty.code === facultyCode)
    ?.programmes.map((programme) => normalizeOrganisationCode(programme.key))

  if (!facultyProgrammeCodes) return organisations

  const organisationsFilteredByFaculty = organisations.filter((organisation) =>
    facultyProgrammeCodes.includes(organisation.code),
  )

  return organisationsFilteredByFaculty
}

export const filterByCourseCode = (organisations, keyword) => {
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

export const getAccess = (organisationId, organisationAccess) =>
  (organisationAccess ?? []).find(({ id }) => id === organisationId)?.access

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
  {
    value: 'FEEDBACK_PERCENTAGE_ASC',
    label: 'courseSummary:orderByFeedbackCountAsc',
  },
  {
    value: 'FEEDBACK_PERCENTAGE_DESC',
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
  FEEDBACK_PERCENTAGE_ASC: {
    organisations: [['feedbackPercentage'], ['asc']],
    courseUnits: [['feedbackPercentage'], ['asc']],
  },
  FEEDBACK_PERCENTAGE_DESC: {
    organisations: [['feedbackPercentage'], ['desc']],
    courseUnits: [['feedbackPercentage'], ['desc']],
  },
  FEEDBACK_RESPONSE_ASC: {
    organisations: [['feedbackResponsePercentage'], ['asc']],
    courseUnits: [['feedbackResponse'], ['asc']],
  },
  FEEDBACK_RESPONSE_DESC: {
    organisations: [['feedbackResponsePercentage'], ['desc']],
    courseUnits: [['feedbackResponse'], ['desc']],
  },
}

const getOrderByArgs = (organisations, orderByCriteria) => {
  if (orderByCriteria.includes('QUESTION_MEAN')) {
    const orderByData = orderByCriteria.split('_')
    const id = Number(orderByData[2])
    const sortOrder = orderByData[3].toLowerCase()

    const index = organisations[0].results.indexOf(
      organisations[0].results.find((result) => result.questionId === id),
    )

    return {
      organisations: [
        [(organisation) => organisation.results[index].mean],
        [sortOrder],
      ],
      courseUnits: [
        [(courseUnit) => courseUnit.results[index].mean],
        [[sortOrder]],
      ],
    }
  }

  return ARGS_BY_ORDER_BY[orderByCriteria]
}

const SORTABLE_FEEDBACK_RESPONSE = {
  NONE: 1,
  OPEN: 2,
  GIVEN: 3,
}

const formatForFeedbackResponse = (organisations) =>
  // Add sortable feedbackResponse attribute to each courseUnit
  organisations.map((organisation) => ({
    ...organisation,
    courseUnits: organisation.courseUnits.map((courseUnit) => ({
      ...courseUnit,
      feedbackResponse:
        SORTABLE_FEEDBACK_RESPONSE[
          getFeedbackResponseGiven(
            courseUnit.feedbackResponseGiven,
            courseUnit.closesAt,
          )
        ],
    })),
  }))

const formatForFeedbackPercentage = (organisations) =>
  // Add sortable feedbackPercentage attribute to each organisation and courseUnit
  organisations.map((organisation) => ({
    ...organisation,
    feedbackPercentage: organisation.feedbackCount / organisation.studentCount,
    courseUnits: organisation.courseUnits.map((courseUnit) => ({
      ...courseUnit,
      feedbackPercentage: courseUnit.feedbackCount / courseUnit.studentCount,
    })),
  }))

export const orderByCriteria = (organisations, orderByCriteria) => {
  if (organisations.length === 0) return []
  const orderByArgs = getOrderByArgs(organisations, orderByCriteria)

  if (orderByCriteria.includes('FEEDBACK_RESPONSE'))
    organisations = formatForFeedbackResponse(organisations)

  if (orderByCriteria.includes('FEEDBACK_PERCENTAGE'))
    organisations = formatForFeedbackPercentage(organisations)

  return orderByArgs
    ? sortBy(
        orderBy(
          organisations.map((organisation) => ({
            ...organisation,
            courseUnits: orderBy(
              organisation.courseUnits,
              ...orderByArgs.courseUnits,
            ),
          })),
          ...orderByArgs.organisations,
        ),
        (org) => (org.feedbackCount ? 0 : 1),
      )
    : sortBy(organisations, (organisation) =>
        organisation.feedbackCount ? 0 : 1,
      )
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
  facultyCode,
  tagId,
  code,
  keyword,
  includeOpenUniCourseUnits,
  dateRange,
  organisationAccess,
}) => {
  const { organisationSummaries, ...rest } = useOrganisationSummaries({
    code,
    tagId,
    includeOpenUniCourseUnits,
    startDate: dateRange?.start,
    endDate: dateRange?.end,
    keepPreviousData: true,
    retry: 2,
    enabled: Boolean(dateRange?.start && dateRange?.end),
  })

  const withAccess = useMemo(
    () =>
      organisationSummaries?.organisations?.map((org) => ({
        ...org,
        access: getAccess(org.id, organisationAccess),
      })) ?? [],
    [organisationSummaries?.organisations, organisationAccess],
  )

  const filteredOrganisations = useMemo(
    () => filterByCourseCode(withAccess, keyword),
    [withAccess, keyword],
  )

  const facultyOrganisations = useMemo(
    () => filterByFaculty(filteredOrganisations, facultyCode),
    [filteredOrganisations, facultyCode],
  )

  const sortedOrganisations = useMemo(
    () => orderByCriteria(facultyOrganisations, orderBy),
    [facultyOrganisations, orderBy],
  )

  return {
    organisationSummaries,
    aggregatedOrganisations: sortedOrganisations,
    ...rest,
  }
}

/**
 *
 * @param {Date | string | number} date
 * @return {Date} first day of study year
 */
export const startOfStudyYear = (date) => {
  // Year starting month
  const MONTH = 8

  let d = null
  if (typeof date !== 'object') {
    d = new Date(date)
  } else {
    d = date
  }

  const year = d.getFullYear() - (d.getMonth() + 1 < MONTH ? 1 : 0)

  return new Date(`${year}-${MONTH}-01`)
}
