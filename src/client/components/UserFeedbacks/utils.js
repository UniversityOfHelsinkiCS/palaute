import groupBy from 'lodash/groupBy'
import { parseISO } from 'date-fns'

export const courseRealisationIsMisisingFeedback = (courseRealisation) => {
  if (!Array.isArray(courseRealisation.feedbackTargets)) {
    return false
  }

  const missing = courseRealisation.feedbackTargets.find(
    ({ feedback }) => !feedback,
  )

  return Boolean(missing)
}

const courseRealisationSortFn = (a, b) =>
  parseISO(b.endDate) - parseISO(a.endDate)

export const sortCourseRealisations = (courseRealisations) => {
  const copy = courseRealisations ? [...courseRealisations] : []

  copy.sort(courseRealisationSortFn)

  return copy
}

export const getDeletePath = (userFeedbackTarget) => {
  const feedbackId = userFeedbackTarget?.feedback?.id

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

export const feedbackTargetIsClosed = (feedbackTarget) =>
  parseISO(feedbackTarget.closesAt) < new Date() ||
  parseISO(feedbackTarget.opensAt) > new Date()

export const filterFeedbackTargetsByStatus = (feedbackTargets, status) => {
  if (!feedbackTargets) {
    return []
  }

  if (status === 'waitingForFeedback') {
    return feedbackTargets.filter(
      (feedbackTarget) =>
        !feedbackTargetIsClosed(feedbackTarget) && !feedbackTarget.feedback,
    )
  }

  if (status === 'feedbackGiven') {
    return feedbackTargets.filter(
      (feedbackTarget) =>
        !feedbackTargetIsClosed(feedbackTarget) && feedbackTarget.feedback,
    )
  }

  if (status === 'feedbackClosed') {
    return feedbackTargets.filter(feedbackTargetIsClosed)
  }

  return feedbackTargets
}
