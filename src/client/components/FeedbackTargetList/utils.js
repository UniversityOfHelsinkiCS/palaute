import { orderBy, groupBy } from 'lodash'
import { format, parseISO } from 'date-fns'

export const formatDate = (date) => format(parseISO(date), 'd.M.yyyy')

export const getCourseRealisationsWithFeedbackTargets = (feedbackTargets) => {
  if (!feedbackTargets) {
    return []
  }

  const courseRealisationById = new Map()

  feedbackTargets.forEach((target) => {
    const { courseRealisation } = target

    courseRealisationById.set(courseRealisation.id, courseRealisation)
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

  return orderBy(courseRealisations, ['startDate'], ['desc'])
}
