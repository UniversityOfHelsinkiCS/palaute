import { format, parseISO } from 'date-fns'
import apiClient from '../../util/apiClient'

export const getUpperLevelQuestions = (survey) =>
  (survey?.universitySurvey?.questions ?? []).filter((q) => q.type !== 'TEXT')

export const getSurveyInitialValues = (survey) => {
  const questions = [
    ...(survey.universitySurvey?.questions ?? []).map((question) => ({
      ...question,
      editable: false,
      chip: 'questionEditor:universityQuestion',
    })),
    ...(survey.questions ?? []).map((question) => ({
      ...question,
      editable: true,
    })),
  ]
  return {
    questions,
  }
}

export const saveSurveyValues = async (values, surveyId) => {
  const { questions } = values
  const editableQuestions = questions.filter(({ editable }) => editable)

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions: editableQuestions,
  })

  return data
}

export const filterCoursesWithNoResponses = (courses) => {
  const coursesWithRealisations = courses.filter(
    (course) => course.realisations.length > 0,
  )

  const remappedCourses = coursesWithRealisations.map((course) => {
    const realisations = course.realisations.map((real) => {
      const remappedQuestions = real.questions.map((q) => ({
        ...q,
        responses: q.responses.filter((r) => r.length >= 5),
      }))
      const questions = remappedQuestions.filter((q) => q.responses.length > 0)
      return { ...real, questions }
    })
    const filteredRealisations = realisations.filter(
      ({ questions }) => questions.length > 0,
    )

    return { ...course, realisations: filteredRealisations }
  })

  const filteredCourses = remappedCourses.filter(
    (course) => course.realisations.length > 0,
  )

  return filteredCourses
}

export const formateDates = (realisation) => {
  const startDate = format(parseISO(realisation.startDate), 'dd.MM.yyyy')
  const endDate = format(parseISO(realisation.endDate), 'dd.MM.yyyy')

  return `${startDate} - ${endDate}`
}
