import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

export const sortCourses = (courses, sortedBy) => {
  const { i18n } = useTranslation()

  const sortedCourses = courses.sort((a, b) => {
    if (sortedBy.sortBy === 'CODE') {
      return a.courseCode < b.courseCode ? -1 : 1
    }

    return getLanguageValue(a.name, i18n.language) <
      getLanguageValue(b.name, i18n.language)
      ? -1
      : 1
  })

  if (sortedBy.reversed) {
    return sortedCourses.reverse()
  }
  return sortedCourses
}
