import { LANGUAGES } from './common'
import { getLanguageValue } from './languageUtils'

export const getCourseCode = ({ courseCode, userCreated }) => (userCreated || !courseCode ? '' : courseCode)

export const getInterimFeedbackName = (feedbackTargetName, courseUnitName, t) => {
  const interimFeedbackName = {}

  LANGUAGES.forEach(language => {
    const fbtName = getLanguageValue(feedbackTargetName, language)
    const cuName = getLanguageValue(courseUnitName, language)

    interimFeedbackName[language] = `${cuName}, ${t('interimFeedback:interimFeedback')}: ${fbtName}`
  })

  return interimFeedbackName
}

export const getSurveyType = (courseUnit, feedbackTarget = {}) => {
  const isOrganisationSurvey = courseUnit.userCreated
  const isInterimFeedback = !isOrganisationSurvey && feedbackTarget?.userCreated

  return {
    isOrganisationSurvey,
    isInterimFeedback,
  }
}

export const getPrimaryCourseName = (courseUnit, courseRealisation, feedbackTarget) => {
  const { isOrganisationSurvey, isInterimFeedback } = getSurveyType(courseUnit, feedbackTarget)

  if (isOrganisationSurvey) return courseRealisation.name
  if (isInterimFeedback) return feedbackTarget.name

  return courseUnit.name
}

export const getSecondaryCourseName = (courseRealisation, courseUnit, feedbackTarget) => {
  const { isOrganisationSurvey, isInterimFeedback } = getSurveyType(courseUnit, feedbackTarget)

  if (isOrganisationSurvey || isInterimFeedback) return courseUnit.name

  return courseRealisation.name
}

export const getSafeCourseCode = ({ courseCode, forUrl = true, safeString = '_' }) => {
  // There are course codes that include slash character (/), which is problematic in URLs and XLSX sheet names.
  // To avoid problems, course codes are encoded for URLs to safely handle slashes. Backend decodes course code before querying database.
  // For XLSX sheet names, slashes are replaced with given safeString (or underscore by default).

  if (!courseCode) return undefined

  if (forUrl) return encodeURIComponent(String(courseCode))

  const safeCourseCode = courseCode.replaceAll('/', safeString)

  return safeCourseCode
}
