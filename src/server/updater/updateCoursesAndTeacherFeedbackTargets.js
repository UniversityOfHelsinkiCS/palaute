const { createCourseUnit } = require('../util/importerCommon')
const {
  validRealisation,
  createFeedbackTargetFromCourseRealisation,
} = require('../util/importerHelpers')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const courseRealisationHandler = async (course) => {
  const courseUnit = course.courseUnits[0] // TODO fix
  const personIds = course.responsibilityInfos
    .filter((data) => data.personId)
    .map((data) => data.personId)
  if (!courseUnit) return
  await createCourseUnit(courseUnit)
  if (!validRealisation(course)) return
  await personIds.reduce(async (promise, personId) => {
    await promise
    await createFeedbackTargetFromCourseRealisation(
      course,
      personId,
      courseUnit,
    )
  }, Promise.resolve())
}

const coursesHandler = async (courses) => {
  await courses.reduce(async (promise, course) => {
    await promise
    try {
      await courseRealisationHandler(course)
    } catch (err) {
      logger.info('ERR', err, course)
    }
  }, Promise.resolve())
}

const updateCoursesAndTeacherFeedbackTargets = async () => {
  await mangleData(
    'course_unit_realisations_with_course_units',
    2000,
    coursesHandler,
  )
}

module.exports = updateCoursesAndTeacherFeedbackTargets
