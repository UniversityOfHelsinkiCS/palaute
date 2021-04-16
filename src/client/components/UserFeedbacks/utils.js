import groupBy from 'lodash/groupBy'

export const courseRealisationIsMisisingFeedback = (courseRealisation) => {
  if (!Array.isArray(courseRealisation.feedbackTargets)) {
    return false
  }

  const missing = courseRealisation.feedbackTargets.find(
    ({ feedbackId }) => !feedbackId,
  )

  return Boolean(missing)
}

const courseRealisationSortFn = (a, b) => {
  const aIsMissingFeedback = courseRealisationIsMisisingFeedback(a)
  const bIsMissingFeedback = courseRealisationIsMisisingFeedback(b)

  if (!aIsMissingFeedback && !bIsMissingFeedback) {
    return a.endDate < b.courseRealisation.endDate ? -1 : 1
  }
  if (!aIsMissingFeedback) {
    return 1
  }
  if (!bIsMissingFeedback) {
    return -1
  }
  return a.id < b.id ? -1 : 1
}

export const sortCourseRealisations = (courseRealisations) =>
  courseRealisations
    ? [...courseRealisations].sort(courseRealisationSortFn)
    : []

export const getDeletePath = (userFeedbackTarget) => {
  const { feedbackId } = userFeedbackTarget

  return feedbackId ? `/feedbacks/${feedbackId}` : null
}

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

  return Object.entries(targetsByCourseRealisationId).map(
    ([courseRealisationId, targets]) => ({
      ...courseRealisationById.get(courseRealisationId),
      feedbackTargets: targets,
    }),
  )
}
