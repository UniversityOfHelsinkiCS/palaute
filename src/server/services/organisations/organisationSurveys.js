const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

const logger = require('../../util/logger')
const { sequelize } = require('../../db/dbConnection')
const { LANGUAGES } = require('../../util/config')
const {
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  CourseRealisationsTag,
  FeedbackTarget,
  FeedbackTargetLog,
  UserFeedbackTarget,
  Organisation,
  Survey,
  User,
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
    name,
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
    opensAt: startDate,
    closesAt: endDate,
    userCreated: true,
  })

  return organisationFeedbackTarget
}

const createUserFeedbackTargets = async (feedbackTarget, studentNumbers, teacherIds) => {
  const students = await User.findAll({
    where: {
      studentNumber: { [Op.in]: studentNumbers },
    },
    attributes: ['id'],
  })

  const studentFeedbackTargets = await UserFeedbackTarget.bulkCreate(
    students.map(({ id }) => ({
      accessStatus: 'STUDENT',
      feedbackTargetId: feedbackTarget.id,
      userId: id,
      userCreated: true,
    }))
  )

  const teacherFeedbackTargets = await UserFeedbackTarget.bulkCreate(
    teacherIds.map(teacherId => ({
      accessStatus: 'RESPONSIBLE_TEACHER',
      feedbackTargetId: feedbackTarget.id,
      userId: teacherId,
      isAdministrativePerson: true,
      userCreated: true,
    }))
  )

  return studentFeedbackTargets.concat(teacherFeedbackTargets)
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

const updateOrganisationSurvey = async (feedbackTargetId, updates) => {
  const { name, startDate, endDate, teacherIds } = updates

  const feebackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  await feebackTarget.update({
    name,
    opensAt: startDate,
    closesAt: endDate,
  })

  const courseRealisation = await CourseRealisation.findByPk(feebackTarget.courseRealisationId)

  await courseRealisation.update({
    name,
    startDate,
    endDate,
  })

  if (teacherIds) {
    await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId,
        accessStatus: 'RESPONSIBLE_TEACHER',
      },
    })

    await UserFeedbackTarget.bulkCreate(
      teacherIds.map(teacherId => ({
        accessStatus: 'RESPONSIBLE_TEACHER',
        feedbackTargetId,
        userId: teacherId,
        isAdministrativePerson: true,
        userCreated: true,
      }))
    )
  }

  const survey = await getOrganisationSurvey(feedbackTargetId)

  return survey
}

const deleteOrganisationSurvey = async feedbackTargetId => {
  const t = await sequelize.transaction()

  try {
    logger.info(`Deleting organisation survey ${feedbackTargetId}`)

    const { courseRealisationId } = await FeedbackTarget.findByPk(feedbackTargetId)

    const ufbt = await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId,
      },
    })

    logger.info(`Deleted ${ufbt} user feedback targets`)

    const survey = await Survey.destroy({
      where: {
        feedbackTargetId,
      },
    })

    logger.info(`Deleted ${survey} surveys`)

    const log = await FeedbackTargetLog.destroy({
      where: {
        feedbackTargetId,
      },
    })

    logger.info(`Deleted ${log} feedback target logs`)

    const fbt = await FeedbackTarget.destroy({
      where: {
        id: feedbackTargetId,
      },
    })

    logger.info(`Deleted ${fbt} feedback targets`)

    const org = await CourseRealisationsOrganisation.destroy({
      where: {
        courseRealisationId,
      },
    })

    logger.info(`Deleted ${org} course realisation organisations`)

    const tag = await CourseRealisationsTag.destroy({
      where: {
        courseRealisationId,
      },
    })

    logger.info(`Deleted ${tag} course realisation tags`)

    const cu = await CourseRealisation.destroy({
      where: {
        id: courseRealisationId,
      },
    })

    logger.info(`Deleted ${cu} course realisations`)
  } catch (err) {
    await t.rollback()
    throw err
  }
}

module.exports = {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  createUserFeedbackTargets,
  getOrganisationSurvey,
  getSurveysForOrganisation,
  updateOrganisationSurvey,
  deleteOrganisationSurvey,
}
