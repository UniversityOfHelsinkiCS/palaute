const { LANGUAGES } = require('../../util/config')
const {
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} = require('../../models')

const initializeOrganisationCourseUnit = async organisation => {
  const existingOrganisationCU = await CourseUnit.findOne({
    where: {
      courseCode: organisation.code,
    },
  })

  if (existingOrganisationCU) return

  const startDate = new Date()
  const endDate = new Date().setFullYear(9999)

  const organisationCourseUnit = await CourseUnit.create({
    courseCode: organisation.code,
    validityPeriod: {
      startDate,
      endDate,
    },
    name: organisation.name,
    userCreated: true,
  })

  await CourseUnitsOrganisation.create({
    type: 'PRIMARY',
    courseUnitId: organisationCourseUnit.id,
    organisationId: organisation.id,
  })
}

const createOrganisationFeedbackTarget = async (organisation, validityPeriod) => {
  const { startDate, endDate } = validityPeriod

  const organisationCourseRealisation = await CourseRealisation.create({
    endDate,
    startDate,
    name: organisation.name,
    teachingLanguages: LANGUAGES,
    userCreated: true,
  })

  await CourseRealisationsOrganisation.create({
    type: 'PRIMARY',
    courseRealisationId: organisationCourseRealisation.id,
    organisationId: organisation.id,
  })
}

module.exports = {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
}
