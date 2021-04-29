const importerClient = require('./importerClient')

const { createCourseUnit, formatDate } = require('./importerCommon')

const {
  createFeedbackTargetFromCourseRealisation,
} = require('./importerHelpers')

const createTargetsFromEnrolment = async (data, userId) => {
  const studySubGroupIds = data.studySubGroups.map(
    (group) => group.studySubGroupId,
  )

  const { courseUnitRealisation, courseUnit } = data
  if (!courseUnit || !courseUnitRealisation) return
  await createCourseUnit(courseUnit)

  await createFeedbackTargetFromCourseRealisation(
    courseUnitRealisation,
    userId,
    courseUnit,
    studySubGroupIds,
  )
}

// this doesn't return anything, it is easier to do separate query for that
const getEnrolmentByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(`/palaute/enrolled/${personId}`, {
    params,
  })

  await data.reduce(async (promise, enrolment) => {
    await promise

    await createTargetsFromEnrolment(enrolment, personId)
  }, Promise.resolve())
}

module.exports = {
  getEnrolmentByPersonId,
}
