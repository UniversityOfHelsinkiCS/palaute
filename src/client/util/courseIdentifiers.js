export const getCourseCode = ({ courseCode, userCreated }) => (userCreated || !courseCode ? '' : courseCode)

export const getPrimaryCourseName = (courseRealisation, courseUnit) => {
  const { name: courseRealisationName } = courseRealisation
  const { name: courseUnitName, userCreated } = courseUnit

  return userCreated ? courseRealisationName : courseUnitName
}

export const getSecondaryCourseName = (courseRealisation, courseUnit) => {
  const { name: courseRealisationName } = courseRealisation
  const { name: courseUnitName, userCreated } = courseUnit

  return userCreated ? courseUnitName : courseRealisationName
}
