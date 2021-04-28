import { useTranslation } from 'react-i18next'

import { isAfter, parseISO } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'

const descendingComparator = (a, b, orderBy) => {
  if (a[orderBy] < b[orderBy]) {
    return -1
  }
  if (a[orderBy] > b[orderBy]) {
    return 1
  }
  return 0
}

const getComparator = (order, orderBy) => {
  const comparator =
    order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  return comparator
}

export const sortCourses = (courses, order, orderBy) => {
  const stabilizedCourses = courses.map((course, index) => [course, index])
  const comparator = getComparator(order, orderBy)
  stabilizedCourses.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedCourses.map((course) => course[0])
}

export const getUniqueCourses = (courseUnits) => {
  const { i18n } = useTranslation()

  if (!courseUnits) return null
  courseUnits.sort((a, b) =>
    a.validityPeriod.endDate < b.validityPeriod.endDate ? 1 : -1,
  )

  const codes = new Set()

  const uniqueCourses = []

  courseUnits.forEach((course) => {
    if (codes.has(course.courseCode)) return
    uniqueCourses.push({ ...course, name: getLanguageValue(course.name, i18n) })
    codes.add(course.courseCode)
  })

  return uniqueCourses
}

export const getRelevantCourses = (courses, relevant) => {
  if (!courses) return null

  const comparisonDate = new Date(2021, 1, 1, 0, 0, 0, 0)

  const filteredCourses = courses.filter((course) => {
    if (!relevant) {
      return !isAfter(parseISO(course.validityPeriod.endDate), comparisonDate)
    }
    return isAfter(parseISO(course.validityPeriod.endDate), comparisonDate)
  })

  return filteredCourses
}
