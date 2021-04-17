const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const {
  makeCreateFeedbackTargetWithUserTargetTable,
  createCourseUnit,
  combineStudyGroupName,
} = require('./importerCommon')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const createFeedbackTargetWithUserTargetTable = makeCreateFeedbackTargetWithUserTargetTable(
  'TEACHER',
)

const createTargetsFromRealisation = async (data, personId) => {
  const courseUnit = data.courseUnits[0] // TODO, create one to many association

  await createCourseUnit(courseUnit)
  const { id: courseUnitId } = courseUnit

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
    personId,
  )

  await data.studyGroupSets.reduce(async (prom, studySet) => {
    await prom
    const setName = studySet.name
    await studySet.studySubGroups.reduce(async (promise, item) => {
      await promise
      await createFeedbackTargetWithUserTargetTable(
        'studySubGroup',
        item.id,
        data.id,
        courseUnitId,
        combineStudyGroupName(setName, item.name),
        endDate,
        personId,
      )
    })
  }, Promise.resolve())
}

const getResponsibleByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(
    `/palaute/responsible/${personId}`,
    {
      params,
    },
  )

  const { courseUnitRealisations } = data

  await courseUnitRealisations.reduce(async (promise, realisation) => {
    await promise
    await createTargetsFromRealisation(realisation, personId)
  }, Promise.resolve())
}

module.exports = {
  getResponsibleByPersonId,
}
