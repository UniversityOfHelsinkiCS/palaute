const dateFns = require('date-fns')

const {
  makeCreateFeedbackTargetWithUserTargetTable,
  combineStudyGroupName,
} = require('./importerCommon')

const validRealisationTypes = [
  'urn:code:course-unit-realisation-type:teaching-participation-lab',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-field-course',
  'urn:code:course-unit-realisation-type:teaching-participation-project',
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-small-group',
]

const validRealisation = (realisation) =>
  validRealisationTypes.includes(realisation.courseUnitRealisationTypeUrn)

const createFeedbackTargetFromCourseRealisation = async (
  realisation,
  userId,
  courseUnit,
  studySubGroupIds,
) => {
  const personType = studySubGroupIds ? 'STUDENT' : 'TEACHER'

  const createFeedbackTargetWithUserTargetTable = makeCreateFeedbackTargetWithUserTargetTable(
    personType,
  )

  if (
    realisation.courseUnitRealisationTypeUrn ===
    'urn:code:course-unit-realisation-type:exam-exam'
  )
    return

  const { id: courseUnitId } = courseUnit

  const endDate = dateFns.parse(
    realisation.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )

  const startDate = dateFns.parse(
    realisation.activityPeriod.startDate,
    'yyyy-MM-dd',
    new Date(),
  )

  await createFeedbackTargetWithUserTargetTable(
    'courseRealisation',
    realisation.id,
    realisation.id,
    courseUnitId,
    realisation.name,
    endDate,
    startDate,
    userId,
  )
  await realisation.studyGroupSets.reduce(async (prom, studySet) => {
    await prom
    const setName = studySet.name
    await studySet.studySubGroups
      .filter((group) =>
        studySubGroupIds ? studySubGroupIds.includes(group.id) : true,
      )
      .reduce(async (promise, group) => {
        await promise
        await createFeedbackTargetWithUserTargetTable(
          'studySubGroup',
          group.id,
          realisation.id,
          courseUnitId,
          combineStudyGroupName(setName, group.name),
          endDate,
          startDate,
          userId,
        )
      }, Promise.resolve())
  }, Promise.resolve())
}

module.exports = {
  createFeedbackTargetFromCourseRealisation,
  validRealisation,
}
