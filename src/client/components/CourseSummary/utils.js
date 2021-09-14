import { isBefore, parseISO } from 'date-fns'

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

export const filterByCourseCode = (organisations, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return organisations
  }

  const organisationsWithFilteredCourseUnits = organisations.map(
    ({ courseUnits, ...org }) => ({
      courseUnits: (courseUnits ?? []).filter(({ courseCode }) =>
        courseCodeMatches(courseCode, keyword),
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
