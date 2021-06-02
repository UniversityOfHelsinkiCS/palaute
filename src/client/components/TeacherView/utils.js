import { useTranslation } from 'react-i18next'

import { isAfter, parseISO, format } from 'date-fns'

import { getLanguageValue } from '../../util/languageUtils'

export const getUniqueCourses = (courseUnits) => {
  const { i18n } = useTranslation()

  if (!courseUnits) return null
  courseUnits.sort((a, b) => {
    const Adate = a.validityPeriod.endDate
      ? a.validityPeriod.endDate
      : a.validityPeriod.startDate
    const Bdate = b.validityPeriod.endDate
      ? b.validityPeriod.endDate
      : b.validityPeriod.startDate
    return Adate < Bdate ? 1 : -1
  })

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
    const date = course.validityPeriod.endDate
      ? course.validityPeriod.endDate
      : course.validityPeriod.startDate
    if (!relevant) {
      return !isAfter(parseISO(date), comparisonDate)
    }
    return isAfter(parseISO(date), comparisonDate)
  })

  return filteredCourses
}

export const formatValidityPeriod = (validityPeriod) => {
  const parsedStartDate = parseISO(validityPeriod.startDate)
  const parsedEndDate = parseISO(validityPeriod.endDate)

  if (Number.isNaN(parsedEndDate.getTime())) {
    return {
      startDate: format(parsedStartDate, 'dd.MM.yyyy'),
      endDate: format(parsedStartDate, 'dd.MM.yyyy'),
    }
  }

  return {
    startDate: format(parsedStartDate, 'dd.MM.yyyy'),
    endDate: format(parsedEndDate, 'dd.MM.yyyy'),
  }
}
