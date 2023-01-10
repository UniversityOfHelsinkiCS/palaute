import groupBy from 'lodash/groupBy'

import { INCLUDE_COURSES } from '../../../config'

export const courseRealisationIsMisisingFeedback = courseRealisation => {
  if (!Array.isArray(courseRealisation.feedbackTargets)) {
    return false
  }

  const missing = courseRealisation.feedbackTargets.find(({ feedback }) => !feedback)

  return Boolean(missing)
}

const courseRealisationSortFn = (a, b) =>
  new Date(b.feedbackTargets[0].closesAt) - new Date(a.feedbackTargets[0].closesAt)

export const sortCourseRealisations = courseRealisations => {
  const copy = courseRealisations ? [...courseRealisations] : []

  copy.sort(courseRealisationSortFn)

  return copy
}

export const getDeletePath = userFeedbackTarget => {
  const feedbackId = userFeedbackTarget?.feedback?.id

  return feedbackId ? `/feedbacks/${feedbackId}` : null
}

export const getCourseRealisationsWithFeedbackTargets = feedbackTargets => {
  if (!feedbackTargets) {
    return []
  }

  const courseRealisationById = new Map()

  feedbackTargets.forEach(target => {
    const { courseRealisation } = target
    courseRealisation.courseUnitName = target.courseUnit.name

    courseRealisationById.set(courseRealisation.id, courseRealisation)
  })

  const targetsByCourseRealisationId = groupBy(feedbackTargets, target => target.courseRealisation.id)

  return Object.entries(targetsByCourseRealisationId).map(([courseRealisationId, targets]) => ({
    ...courseRealisationById.get(courseRealisationId),
    feedbackTargets: targets,
  }))
}

export const filterFeedbackTargets = feedbackTargets => {
  if (!feedbackTargets) {
    return []
  }
  const filter = feedbackTargets =>
    feedbackTargets
      .filter(target => new Date(2020, 11, 0) < new Date(target.opensAt))
      .filter(
        target =>
          new Date(target.courseRealisation.startDate) >= new Date(2021, 8, 1) ||
          (new Date(target.courseRealisation.startDate) >= new Date(2021, 7, 15) &&
            new Date(target.courseRealisation.endDate) >= new Date(2021, 9, 1)) ||
          INCLUDE_COURSES.has(target.courseRealisation.id)
      )

  const continuousFeedbackEnabled = feedbackTargets.ongoing.filter(fbt => fbt.continuousFeedbackEnabled)

  return {
    ongoing: feedbackTargets.ongoing ? filter(continuousFeedbackEnabled) : [],
    waiting: feedbackTargets.waiting ? filter(feedbackTargets.waiting) : [],
    given: feedbackTargets.given ? filter(feedbackTargets.given) : [],
    ended: feedbackTargets.ended ? filter(feedbackTargets.ended) : [],
  }
}
