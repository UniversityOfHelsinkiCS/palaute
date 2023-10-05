const { v4: uuidv4 } = require('uuid')

const { LANGUAGES } = require('../../util/config')
const {
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  FeedbackTarget,
  Organisation,
} = require('../../models')

const getOrganisationCourseUnit = async organisationId => {
  const organisationCourseUnit = await CourseUnit.findByPk(organisationId)

  return organisationCourseUnit
}

const initializeOrganisationCourseUnit = async organisation => {
  const existingOrganisationCU = await getOrganisationCourseUnit(organisation.id)

  if (existingOrganisationCU) return

  const startDate = new Date()
  const endDate = new Date().setFullYear(9999)

  const organisationCourseUnit = await CourseUnit.create({
    id: organisation.id,
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
  const { name, startDate, endDate } = feedbackTargetData

  const organisationCourseUnit = await getOrganisationCourseUnit(organisation.id)

  if (!organisationCourseUnit) throw new Error('Organisation course unit not found')

  const organisationCourseRealisation = await CourseRealisation.create({
    id: uuidv4(),
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
    name,
    hidden: false,
    userCreated: true,
  })

  return organisationFeedbackTarget
}

const getOrganisationSurvey = async feedbackTargetId => {
  const organisationSurvey = await FeedbackTarget.findByPk(feedbackTargetId, {
    attributes: ['id', 'courseUnitId', 'courseRealisationId', 'name', 'hidden', 'feedbackType', 'publicQuestionIds'],
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
    ],
  })

  if (!organisationSurvey) throw new Error('Organisation survey not found')

  return organisationSurvey
}

const getSurveysForOrganisation = async organisationId => {
  const organisationSurveys = await FeedbackTarget.findAll({
    attributes: ['id', 'courseUnitId', 'courseRealisationId', 'name', 'hidden', 'feedbackType', 'publicQuestionIds'],
    where: {
      courseUnitId: organisationId,
    },
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
    ],
  })

  return organisationSurveys
}

module.exports = {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  getOrganisationSurvey,
  getSurveysForOrganisation,
}
