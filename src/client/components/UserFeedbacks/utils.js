import groupBy from 'lodash/groupBy'

export const courseRealisationIsMisisingFeedback = (courseRealisation) => {
  if (!Array.isArray(courseRealisation.userFeedbackTargets)) {
    return false
  }

  const missing = courseRealisation.userFeedbackTargets.find(
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

export const getCourseRealisationsWithUserFeedbackTargerts = (
  userFeedbackTargets,
) => {
  if (!userFeedbackTargets) {
    return []
  }

  const courseRealisationById = new Map()

  userFeedbackTargets.forEach((target) => {
    const { courseRealisation } = target.feedbackTarget

    courseRealisationById.set(courseRealisation.id, courseRealisation)
  })

  const targetsByCourseRealisationId = groupBy(
    userFeedbackTargets,
    (target) => target.feedbackTarget.courseRealisation.id,
  )

  return Object.entries(targetsByCourseRealisationId).map(
    ([courseRealisationId, targets]) => ({
      ...courseRealisationById.get(courseRealisationId),
      userFeedbackTargets: targets,
    }),
  )
}
