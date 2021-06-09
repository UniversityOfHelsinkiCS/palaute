import { orderBy, groupBy } from 'lodash'
import { format, parseISO, isAfter } from 'date-fns'

export const formatDate = (date) => format(parseISO(date), 'd.M.yyyy')

export const getCourseRealisationsWithFeedbackTargets = (feedbackTargets) => {
  if (!feedbackTargets) {
    return []
  }

  const courseRealisationById = new Map()

  feedbackTargets.forEach((target) => {
    const { courseRealisation, studentListVisible } = target

    courseRealisationById.set(courseRealisation.id, {
      ...courseRealisation,
      studentListVisible,
    })
  })

  const targetsByCourseRealisationId = groupBy(
    feedbackTargets,
    (target) => target.courseRealisation.id,
  )

  const courseRealisations = Object.entries(targetsByCourseRealisationId).map(
    ([courseRealisationId, targets]) => ({
      ...courseRealisationById.get(courseRealisationId),
      feedbackTargets: targets,
    }),
  )

  const filteredCourseRealisations = courseRealisations.filter((c) =>
    isAfter(parseISO(c.endDate), new Date(2021, 4, 1)),
  )

  return orderBy(filteredCourseRealisations, ['startDate'], ['desc'])
}
