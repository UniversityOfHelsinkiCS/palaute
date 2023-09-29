const { LANGUAGES } = require('../../util/config')
const {
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  FeedbackTarget,
} = require('../../models')

const getOrganisationCourseUnit = async organisationCode => {
  const organisationCourseUnit = await CourseUnit.findOne({
    where: {
      courseCode: organisationCode,
    },
  })

  return organisationCourseUnit
}

const initializeOrganisationCourseUnit = async organisation => {
  const existingOrganisationCU = getOrganisationCourseUnit(organisation.code)

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

const createOrganisationFeedbackTarget = async (organisation, feedbackTargetData) => {
  const { startDate, endDate } = feedbackTargetData

  const organisationCourseUnit = await getOrganisationCourseUnit(organisation.code)

  if (!organisationCourseUnit) throw new Error('Organisation course unit not found')

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

  const organisationFeedbackTarget = await FeedbackTarget.create({
    feedbackType: 'courseRealisation',
    typeId: organisationCourseRealisation.id,
    courseUnitId: organisationCourseUnit.id,
    courseRealisationId: organisationCourseRealisation.id,
    name: organisation.name,
    hidden: false,
    userCreated: true,
  })

  return organisationFeedbackTarget
}

module.exports = {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
}
