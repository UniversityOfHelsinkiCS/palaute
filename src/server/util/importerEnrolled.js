const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const {
  makeCreateFeedbackTargetWithUserTargetTable,
  createCourseUnit,
  combineStudyGroupName,
  formatDate,
} = require('./importerCommon')

const createFeedbackTargetWithUserTargetTable = makeCreateFeedbackTargetWithUserTargetTable(
  'STUDENT',
)

const createFeedbackTargetFromStudyGroup = async (
  data,
  endDate,
  courseUnitId,
  realisationId,
  userId,
  setName,
) => {
  const target = await createFeedbackTargetWithUserTargetTable(
    'studySubGroup',
    data.id,
    realisationId,
    courseUnitId,
    combineStudyGroupName(setName, data.name),
    endDate,
    userId,
  )
  return target
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  studySubGroupIds,
  courseUnitId,
  userId,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  await createFeedbackTargetWithUserTargetTable(
    'courseRealisation',
    data.id,
    data.id,
    courseUnitId,
    data.name,
    endDate,
    userId,
  )
  await data.studyGroupSets.reduce(async (prom, studySet) => {
    await prom
    const setName = studySet.name
    await studySet.studySubGroups
      .filter((group) => studySubGroupIds.includes(group.id))
      .reduce(async (promise, item) => {
        await promise
        await createFeedbackTargetFromStudyGroup(
          item,
          endDate,
          courseUnitId,
          data.id,
          userId,
          setName,
        )
      }, Promise.resolve())
  }, Promise.resolve())
}

const createTargetsFromEnrolment = async (data, userId) => {
  const studySubGroupIds = data.studySubGroups.map(
    (group) => group.studySubGroupId,
  )

  const { courseUnitId, courseUnitRealisation, courseUnit } = data
  await createCourseUnit(courseUnit)

  await createFeedbackTargetFromCourseRealisation(
    courseUnitRealisation,
    studySubGroupIds,
    courseUnitId,
    userId,
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
