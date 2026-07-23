import type { LocalizedString } from '@common/types/common'

import { LANGUAGES } from './common'
import { getLanguageValue } from './languageUtils'

type CourseUnitLike = {
  courseCode?: string
  userCreated?: boolean
  name?: LocalizedString
}

type CourseRealisationLike = {
  name?: LocalizedString
}

type FeedbackTargetLike = {
  userCreated?: boolean
  name?: LocalizedString
}

export const getCourseCode = ({ courseCode, userCreated }: CourseUnitLike) =>
  userCreated || !courseCode ? '' : courseCode

export const getInterimFeedbackName = (
  feedbackTargetName: LocalizedString,
  courseRealisationName: LocalizedString,
  t: (key: string) => string
): LocalizedString => {
  const interimFeedbackName: LocalizedString = {}

  LANGUAGES.forEach(language => {
    const fbtName = getLanguageValue(feedbackTargetName, language)
    const curName = getLanguageValue(courseRealisationName, language)

    interimFeedbackName[language] = `${curName}, ${t('interimFeedback:interimFeedback')}: ${fbtName}`
  })

  return interimFeedbackName
}

export const getSurveyType = (courseUnit: CourseUnitLike, feedbackTarget: FeedbackTargetLike = {}) => {
  const isOrganisationSurvey = courseUnit.userCreated
  const isInterimFeedback = !isOrganisationSurvey && feedbackTarget?.userCreated

  return {
    isOrganisationSurvey,
    isInterimFeedback,
  }
}

export const getPrimaryCourseName = (
  courseUnit: CourseUnitLike,
  courseRealisation: CourseRealisationLike,
  feedbackTarget: FeedbackTargetLike
) => {
  const { isInterimFeedback } = getSurveyType(courseUnit, feedbackTarget)

  if (isInterimFeedback) return feedbackTarget.name

  return courseRealisation.name
}

export const getSecondaryCourseName = (
  courseRealisation: CourseRealisationLike,
  courseUnit: CourseUnitLike,
  feedbackTarget: FeedbackTargetLike,
  language: string
) => {
  const { isOrganisationSurvey, isInterimFeedback } = getSurveyType(courseUnit, feedbackTarget)

  if (isOrganisationSurvey) return getLanguageValue(courseUnit.name, language)
  if (isInterimFeedback) return getLanguageValue(courseRealisation.name, language)

  return getCourseCode(courseUnit)
}

type GetSafeCourseCodeParams = {
  courseCode?: string
  forUrl?: boolean
  safeString?: string
}

export const getSafeCourseCode = ({ courseCode, forUrl = true, safeString = '_' }: GetSafeCourseCodeParams) => {
  // There are course codes that include slash character (/), which is problematic in URLs and XLSX sheet names.
  // To avoid problems, course codes are encoded for URLs to safely handle slashes. Backend decodes course code before querying database.
  // For XLSX sheet names, slashes are replaced with given safeString (or underscore by default).

  if (!courseCode) return undefined

  if (forUrl) return encodeURIComponent(courseCode)

  const safeCourseCode = courseCode.replaceAll('/', safeString)

  return safeCourseCode
}
