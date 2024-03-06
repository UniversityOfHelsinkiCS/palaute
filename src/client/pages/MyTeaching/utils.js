import { orderBy } from 'lodash'
import { lightFormat, startOfHour } from 'date-fns'

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

const isInterimFeedback = ({ userCreated, courseUnit }) => userCreated && !courseUnit.userCreated

export const getRelevantFeedbackTargets = feedbackTargets => {
  const courseRealisationTargets = feedbackTargets.filter(
    fbt => fbt.feedbackType === 'courseRealisation' && !isInterimFeedback(fbt)
  )

  return orderBy(courseRealisationTargets, [({ courseRealisation }) => courseRealisation.startDate], ['desc'])
}

export const getFeedbackTargetQueryOptions = group => {
  switch (group) {
    case 'ONGOING':
      return {
        courseRealisationStartDateBefore: startOfHour(new Date()),
        courseRealisationEndDateAfter: startOfHour(new Date()),
      }
    case 'UPCOMING':
      return {
        courseRealisationStartDateAfter: startOfHour(new Date()),
      }
    case 'ENDED':
      return {
        courseRealisationEndDateBefore: startOfHour(new Date()),
        courseRealisationEndDateAfter: startOfHour(new Date(2021, 3, 1)),
      }
    default:
      return {}
  }
}

export const getFeedbackPercentageString = feedbackTarget => {
  const { feedbackCount, studentCount } = feedbackTarget

  if (!feedbackCount || !studentCount) {
    return '0%'
  }

  return `${Math.round((feedbackCount / studentCount) * 100)}%`
}
