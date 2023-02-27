import { format, parseISO, isWithinInterval } from 'date-fns'

export const getUpperLevelQuestions = survey =>
  (survey?.universitySurvey?.questions ?? []).filter(q => q.type !== 'TEXT')

export const filterCoursesWithNoResponses = courses => {
  const coursesWithRealisations = courses.filter(course => course.realisations.length > 0)

  const remappedCourses = coursesWithRealisations.map(course => {
    const realisations = course.realisations.map(real => {
      const remappedQuestions = real.questions.map(q => ({
        ...q,
        responses: q.responses.filter(r => r.length >= 5),
      }))
      const questions = remappedQuestions.filter(q => q.responses.length > 0)
      return { ...real, questions }
    })
    const filteredRealisations = realisations.filter(({ questions }) => questions.length > 0)

    return { ...course, realisations: filteredRealisations }
  })

  const filteredCourses = remappedCourses.filter(course => course.realisations.length > 0)

  return filteredCourses
}

export const filterCoursesByDate = (courses, dateRange) => {
  const filteredCourses = courses.map(course => ({
    ...course,
    realisations: course.realisations.filter(realisation =>
      isWithinInterval(parseISO(realisation.startDate), dateRange)
    ),
  }))

  const coursesWithRealisations = filteredCourses.filter(course => course.realisations.length > 0)

  return coursesWithRealisations
}

export const formateDates = realisation => {
  const startDate = format(parseISO(realisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(realisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}
