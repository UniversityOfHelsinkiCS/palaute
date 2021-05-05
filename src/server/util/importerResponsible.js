const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const {
  createCourseUnit,
  deleteOldUserFeedbackTargets,
} = require('./importerCommon')

const {
  createFeedbackTargetFromCourseRealisation,
} = require('./importerHelpers')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

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
  const courseRealisationIds = []
  await courseUnitRealisations.reduce(async (promise, realisation) => {
    await promise
    if (realisation.courseUnits.length === 0) return
    courseRealisationIds.push(realisation.id)
    const courseUnit = realisation.courseUnits[0] // TODO, wtf
    await createCourseUnit(courseUnit)
    await createFeedbackTargetFromCourseRealisation(
      realisation,
      personId,
      courseUnit,
    )
  }, Promise.resolve())

  // delete unused userFeedbackTargets
  // at the moment it is enough to delete the userFeedbacktarget and leave ghost feedbackTargets
  await deleteOldUserFeedbackTargets(personId, courseRealisationIds, 'TEACHER')
}

module.exports = {
  getResponsibleByPersonId,
}
