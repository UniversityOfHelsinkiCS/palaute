import { lightFormat } from 'date-fns'
import { orderBy } from 'lodash-es'

import feedbackTargetCourseIsOngoing from '../../../util/feedbackTargetCourseIsOngoing'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'

export const hasOngoingInterimFeedbacks = interimFeedbacktargets =>
  interimFeedbacktargets.some(interimFeedbackTarget => feedbackTargetIsOpen(interimFeedbackTarget))

export const isMissingFeedbackResponse = feedbackTarget =>
  feedbackTargetIsEnded(feedbackTarget) &&
  !feedbackTargetIsOld(feedbackTarget) &&
  (feedbackTarget.feedbackCount > 0 || Boolean(feedbackTarget.feedbackResponseGiven)) &&
  !feedbackTarget.feedbackResponseSent

const hasOngoingContinuousFeedback = (feedbackTarget, courseRealisation) =>
  feedbackTarget.continuousFeedbackEnabled &&
  feedbackTargetCourseIsOngoing({ courseRealisation, opensAt: feedbackTarget.opensAt }) &&
  !feedbackTargetIsOpen(feedbackTarget)

export const courseUnitNeedsAttention = courseUnit =>
  courseUnit.courseRealisations.some(
    courseRealisation =>
      hasOngoingInterimFeedbacks(courseRealisation.interimFeedbackTargets) ||
      courseRealisation.feedbackTargets.some(
        feedbackTarget =>
          isMissingFeedbackResponse(feedbackTarget) || hasOngoingContinuousFeedback(feedbackTarget, courseRealisation)
      )
  )

export const courseUnitHasOpenSurvey = courseUnit =>
  courseUnit.courseRealisations.some(courseRealisation =>
    courseRealisation.feedbackTargets.some(feedbackTarget => feedbackTargetIsOpen(feedbackTarget))
  )

export const getGroupedCourseUnits = courseUnits => {
  const normalizedCourseUnits = courseUnits ?? []

  const ongoing = normalizedCourseUnits.filter(({ ongoingCourseRealisation }) => ongoingCourseRealisation)

  const upcoming = normalizedCourseUnits.filter(({ upcomingCourseRealisation }) => upcomingCourseRealisation)

  const ended = normalizedCourseUnits.filter(({ endedCourseRealisation }) => endedCourseRealisation)

  return {
    ongoing: orderBy(ongoing, [({ ongoingCourseRealisation }) => ongoingCourseRealisation.startDate], ['desc']),
    upcoming: orderBy(upcoming, [({ upcomingCourseRealisation }) => upcomingCourseRealisation.startDate], ['asc']),
    ended: orderBy(ended, [({ endedCourseRealisation }) => endedCourseRealisation.startDate], ['desc']),
  }
}

export const formatDate = date => lightFormat(new Date(date), 'dd.MM.yyyy')

export const getFeedbackPercentageString = (feedbackCount, studentCount) => {
  if (!feedbackCount || !studentCount) {
    return '0%'
  }

  return `${Math.round((feedbackCount / studentCount) * 100)}%`
}
