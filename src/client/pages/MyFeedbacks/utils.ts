import type { LocalizedString } from '@common/types/common'
import type {
  CourseRealisation,
  FeedbackTargetForStudent,
  GetFeedbackTargetsForStudentResponse,
} from '@common/types/feedbackTarget'

import { groupBy } from 'lodash-es'

import { INCLUDE_COURSES } from '../../util/common'
import { getInterimFeedbackName } from '../../util/courseIdentifiers'

type CourseRealisationWithNames = CourseRealisation & {
  courseUnitName?: LocalizedString
  courseCode?: string
}

export type CourseRealisationWithFeedbackTargets = CourseRealisationWithNames & {
  feedbackTargets: FeedbackTargetForStudent[]
}

const courseRealisationSortFn = (a: CourseRealisationWithFeedbackTargets, b: CourseRealisationWithFeedbackTargets) =>
  new Date(b.feedbackTargets[0].closesAt).getTime() - new Date(a.feedbackTargets[0].closesAt).getTime()

export const sortCourseRealisations = (courseRealisations?: CourseRealisationWithFeedbackTargets[]) => {
  const copy = courseRealisations ? [...courseRealisations] : []

  copy.sort(courseRealisationSortFn)

  return copy
}

export const getCourseRealisationsWithFeedbackTargets = (
  feedbackTargets?: FeedbackTargetForStudent[]
): CourseRealisationWithFeedbackTargets[] => {
  if (!feedbackTargets) {
    return []
  }

  const courseRealisationById = new Map<string, CourseRealisationWithNames>()

  feedbackTargets.forEach(target => {
    const { courseRealisation } = target

    courseRealisationById.set(courseRealisation.id, {
      ...courseRealisation,
      courseUnitName: target.courseUnit.name,
      courseCode: target.courseUnit.courseCode,
    })
  })

  const targetsByCourseRealisationId = groupBy(feedbackTargets, target => target.courseRealisation.id)

  return Object.entries(targetsByCourseRealisationId).map(([courseRealisationId, targets]) => {
    // every key here comes from feedbackTargets, which is what courseRealisationById was built from
    const courseRealisation = courseRealisationById.get(courseRealisationId)!

    return { ...courseRealisation, feedbackTargets: targets }
  })
}

export const filterFeedbackTargets = (
  feedbackTargets?: GetFeedbackTargetsForStudentResponse
): GetFeedbackTargetsForStudentResponse => {
  if (!feedbackTargets) {
    return { ongoing: [], waiting: [], given: [], ended: [] }
  }
  const filter = (targets: FeedbackTargetForStudent[]) =>
    targets
      .filter(target => new Date(2020, 11, 0) < new Date(target.opensAt))
      .filter(
        target =>
          new Date(target.courseRealisation.startDate) >= new Date(2021, 8, 1) ||
          (new Date(target.courseRealisation.startDate) >= new Date(2021, 7, 15) &&
            new Date(target.courseRealisation.endDate) >= new Date(2021, 9, 1)) ||
          INCLUDE_COURSES.includes(target.courseRealisation.id)
      )

  const continuousFeedbackEnabled = feedbackTargets.ongoing.filter(fbt => fbt.continuousFeedbackEnabled)

  return {
    ongoing: feedbackTargets.ongoing ? filter(continuousFeedbackEnabled) : [],
    waiting: feedbackTargets.waiting ? filter(feedbackTargets.waiting) : [],
    given: feedbackTargets.given ? filter(feedbackTargets.given) : [],
    ended: feedbackTargets.ended ? filter(feedbackTargets.ended) : [],
  }
}

export const getTargetsForStatus = (
  feedbackTargets: GetFeedbackTargetsForStudentResponse,
  status: string
): FeedbackTargetForStudent[] => {
  switch (status) {
    case 'ongoing':
      return feedbackTargets.ongoing
    case 'given':
      return feedbackTargets.given
    case 'ended':
      return feedbackTargets.ended
    default:
      return feedbackTargets.waiting
  }
}

export const getCourseName = (feedbackTarget: FeedbackTargetForStudent, t: (key: string) => string) => {
  const { courseUnit, courseRealisation, userCreated } = feedbackTarget

  if (courseUnit.userCreated) return courseRealisation.name
  if (userCreated) return getInterimFeedbackName(feedbackTarget.name, courseUnit.name, t)

  return courseUnit.name
}
