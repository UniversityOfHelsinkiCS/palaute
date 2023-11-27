export const getCourseCode = ({ courseCode, userCreated }) => (userCreated || !courseCode ? '' : courseCode)

const getSurveyType = (courseUnit, feedbackTarget = {}) => {
  const isOrganisationSurvey = courseUnit.userCreated
  const isInterimSurvey = !isOrganisationSurvey && feedbackTarget?.userCreated

  return {
    isOrganisationSurvey,
    isInterimSurvey,
  }
}

export const getPrimaryCourseName = (courseUnit, courseRealisation, feedbackTarget) => {
  const { isOrganisationSurvey, isInterimSurvey } = getSurveyType(courseUnit, feedbackTarget)

  if (isOrganisationSurvey) return courseRealisation.name
  if (isInterimSurvey) return feedbackTarget.name

  return courseUnit.name
}

export const getSecondaryCourseName = (courseRealisation, courseUnit, feedbackTarget) => {
  const { isOrganisationSurvey, isInterimSurvey } = getSurveyType(courseUnit, feedbackTarget)

  if (isOrganisationSurvey || isInterimSurvey) return courseUnit.name

  return courseRealisation.name
}
