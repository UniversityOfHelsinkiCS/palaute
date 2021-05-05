import { useTranslation } from 'react-i18next'

import { isAfter, parseISO } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'

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
