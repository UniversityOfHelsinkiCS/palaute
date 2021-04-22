const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { createCourseUnit } = require('./importerCommon')

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

  await courseUnitRealisations.reduce(async (promise, realisation) => {
    await promise
    const courseUnit = realisation.courseUnits[0] // TODO, wtf
    await createCourseUnit(courseUnit)
    await createFeedbackTargetFromCourseRealisation(
      realisation,
      personId,
      courseUnit,
    )
  }, Promise.resolve())
}

module.exports = {
  getResponsibleByPersonId,
}
