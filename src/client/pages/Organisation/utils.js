import * as Yup from 'yup'
import { format, parseISO } from 'date-fns'

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
    realisations: course.realisations.filter(
      realisation =>
        dateRange.end >= parseISO(realisation.startDate) && dateRange.start <= parseISO(realisation.endDate)
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

export const getStudentListVisibility = ({ studentListVisible, studentListVisibleByCourse }) => {
  if (studentListVisibleByCourse) return 'byCourse'
  if (studentListVisible) return 'visible'
  return 'hidden'
}

export const getOrganisationSurveySchema = t =>
  Yup.object().shape({
    name: Yup.object().shape(
      {
        fi: Yup.string().when(['sv', 'en'], {
          is: (sv, en) => !sv && !en,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
        sv: Yup.string().when(['fi', 'en'], {
          is: (fi, en) => !fi && !en,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
        en: Yup.string().when(['fi', 'sv'], {
          is: (fi, sv) => !fi && !sv,
          then: () => Yup.string().required(t('validationErrors:required')),
          otherwise: () => Yup.string(),
        }),
      },
      [
        ['sv', 'en'],
        ['fi', 'en'],
        ['fi', 'sv'],
      ]
    ),
    startDate: Yup.date().required(t('validationErrors:invalidDate')),
    endDate: Yup.date()
      .required(t('validationErrors:invalidDate'))
      .min(Yup.ref('startDate'), t('validationErrors:wrongDate')),
    studentNumbers: Yup.array().of(Yup.string()),
    teachers: Yup.array().of(Yup.object()).min(1, t('validationErrors:required')),
  })

export const getOverlappingStudentTeachers = data => {
  const { studentNumbers } = data
  const overlappingStudentTeachers = data.teachers.filter(t => studentNumbers.includes(t.studentNumber))

  return overlappingStudentTeachers
}
