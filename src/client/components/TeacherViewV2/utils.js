import { orderBy } from 'lodash'
import { lightFormat, isAfter, startOfDay } from 'date-fns'

export const getGroupedCourseUnits = (courseUnits) => {
  const ongoing = courseUnits.filter(
    ({ ongoingCourseRealisation }) => ongoingCourseRealisation,
  )

  const upcoming = courseUnits.filter(
    ({ upcomingCourseRealisation }) => upcomingCourseRealisation,
  )

  const ended = courseUnits.filter(
    ({ endedCourseRealisation }) => endedCourseRealisation,
  )

  return {
    ongoing: orderBy(
      ongoing,
      [({ ongoingCourseRealisation }) => ongoingCourseRealisation.startDate],
      ['desc'],
    ),
    upcoming: orderBy(
      upcoming,
      [({ upcomingCourseRealisation }) => upcomingCourseRealisation.startDate],
      ['asc'],
    ),
    ended: orderBy(
      ended,
      [({ endedCourseRealisation }) => endedCourseRealisation.startDate],
      ['desc'],
    ),
  }
}

export const formatDate = (date) => lightFormat(new Date(date), 'dd.MM.yyyy')

export const getRelevantCourseRealisation = (courseUnit, group) => {
  switch (group) {
    case 'ONGOING':
      return courseUnit.ongoingCourseRealisation
    case 'UPCOMING':
      return courseUnit.upcomingCourseRealisation
    case 'ENDED':
      return courseUnit.endedCourseRealisation
    default:
      return null
  }
}

export const getRelevantFeedbackTargets = (feedbackTargets) => {
  const courseRealisationTargets = feedbackTargets.filter(
    ({ feedbackType, courseRealisation }) =>
      feedbackType === 'courseRealisation' &&
      isAfter(new Date(courseRealisation.endDate), new Date(2021, 4, 1)),
  )

  return orderBy(
    courseRealisationTargets,
    [({ courseRealisation }) => courseRealisation.startDate],
    ['desc'],
  )
}

export const getFeedbackTargetQueryOptions = (group) => {
  switch (group) {
    case 'ONGOING':
      return {
        courseRealisationStartDateBefore: startOfDay(new Date()),
        courseRealisationEndDateAfter: startOfDay(new Date()),
      }
    case 'UPCOMING':
      return {
        courseRealisationStartDateAfter: startOfDay(new Date()),
      }
    case 'ENDED':
      return {
        courseRealisationEndDateBefore: startOfDay(new Date()),
      }
    default:
      return {}
  }
}
