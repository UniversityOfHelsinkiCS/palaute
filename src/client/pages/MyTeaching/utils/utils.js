import { orderBy } from 'lodash-es'
import { lightFormat } from 'date-fns'

import feedbackTargetIsOld from '../../../util/feedbackTargetIsOld'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'

export const getLatestFeedbackTarget = courseRealisations => {
  if (courseRealisations.length === 0) return true

  const latestCourseRealisation = courseRealisations[0]

  const { feedbackTargets } = latestCourseRealisation
  const latestFeedbackTarget = feedbackTargets[0]

  const isOld = feedbackTargetIsOld(latestFeedbackTarget)
  const isEnded = feedbackTargetIsEnded(latestFeedbackTarget)

  return { ...latestFeedbackTarget, isOld, isEnded }
}

export const hasOngoingInterimFeedbacks = interimFeedbacktargets =>
  interimFeedbacktargets.some(interimFeedbackTarget => feedbackTargetIsOpen(interimFeedbackTarget))

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
