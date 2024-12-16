const { Op, or } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const { i18n } = require('../../util/i18n')

const { logger } = require('../../util/logger')
const { formatActivityPeriod } = require('../../util/common')
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
  OrganisationSurveyCourse,
} = require('../../models')

const getOrganisationCourseUnit = async organisationId => {
  const organisationCourseUnit = await CourseUnit.findOne({
    where: {
      userCreated: true,
    },
    include: [
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        where: {
          organisationId,
        },
        required: true,
        attributes: [],
      },
    ],
  })

  return organisationCourseUnit
}

const getCourseUnitName = organisationName => {
  const name = {}

  LANGUAGES.forEach(language => {
    const t = i18n.getFixedT(language)
    name[language] = `${organisationName[language]}: ${t('organisationSurveys:surveys')}`
  })

  return name
}

const initializeOrganisationCourseUnit = async organisation => {
  const existingOrganisationCU = await getOrganisationCourseUnit(organisation.id)

  if (existingOrganisationCU) return

  const startDate = new Date()
  const endDate = new Date().setFullYear(9999)

  const organisationCourseUnit = await CourseUnit.create({
    id: uuidv4(),
    courseCode: `${organisation.code}-SRV`,
    validityPeriod: {
      startDate,
      endDate,
    },
    name: getCourseUnitName(organisation.name),
    userCreated: true,
  })

  await CourseUnitsOrganisation.create({
    type: 'PRIMARY',
    courseUnitId: organisationCourseUnit.id,
    organisationId: organisation.id,
  })
}

const createOrganisationFeedbackTarget = async (organisation, feedbackTargetData) => {
  const { name } = feedbackTargetData
  const { startDate, endDate } = formatActivityPeriod(feedbackTargetData)

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

const getStudentIds = async studentNumbers => {
  const students = await User.findAll({
    where: {
      studentNumber: { [Op.in]: studentNumbers },
    },
    attributes: ['id'],
  })

  const studentIds = students.map(({ id }) => id)

  return studentIds
}

const createUserFeedbackTargets = async (feedbackTargetId, userIds, accessStatus) => {
  const createdUserFeedbackTargets = []

  for (const userId of userIds) {
    try {
      const userFeedbackTarget = await UserFeedbackTarget.create({
        accessStatus,
        feedbackTargetId,
        userId,
        isAdministrativePerson: accessStatus === 'RESPONSIBLE_TEACHER',
        userCreated: true,
      })
      createdUserFeedbackTargets.push(userFeedbackTarget)
    } catch (error) {
      logger.error(`Error creating feedback target for user ${userId}:`, error.message)
    }
  }

  return createdUserFeedbackTargets
}

const getUserFeedbackTargets = async (feedbackTargetId, accessStatus) => {
  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus,
    },
    attributes: ['id', 'userId'],
  })

  return userFeedbackTargets
}

const getSurveyById = async feedbackTargetId => {
  const organisationSurvey = await FeedbackTarget.findByPk(feedbackTargetId, {
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'name',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'opensAt',
      'closesAt',
    ],
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
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'students',
        required: false,
        where: { accessStatus: 'STUDENT' },
        include: {
          model: User,
          attributes: ['studentNumber'],
          as: 'user',
        },
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'RESPONSIBLE_TEACHER',
        },
        include: {
          model: User,
          as: 'user',
        },
      },
    ],
  })

  const courseIds = await OrganisationSurveyCourse.findAll({
    where: {
      feedbackTargetId,
    },
    attributes: ['courseRealisationId'],
  })

  if (!organisationSurvey || !courseIds) throw new Error('Organisation survey not found')

  const courses = await CourseRealisation.findAll({
    where: {
      id: { [Op.in]: courseIds.map(({ courseRealisationId }) => courseRealisationId) },
    },
    attributes: ['id', 'name', 'startDate', 'endDate'],
  })

  return {
    ...organisationSurvey.dataValues,
    courses,
  }
}

const getSurveysForOrganisation = async organisationId => {
  const organisationSurveys = await FeedbackTarget.findAll({
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'name',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'feedbackCount',
      'feedbackResponse',
      'feedbackResponseEmailSent',
      'opensAt',
      'closesAt',
    ],
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        where: {
          userCreated: true,
        },
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
          {
            model: CourseUnitsOrganisation,
            as: 'courseUnitsOrganisations',
            where: {
              organisationId,
            },
            required: true,
            attributes: [],
          },
        ],
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'students',
        required: false,
        where: { accessStatus: 'STUDENT' },
        include: {
          model: User,
          attributes: ['studentNumber'],
          as: 'user',
        },
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id', 'userId', 'accessStatus'],
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'RESPONSIBLE_TEACHER',
        },
        include: {
          model: User,
          as: 'user',
        },
      },
    ],
    order: [['courseRealisation', 'endDate', 'DESC']],
  })

  return organisationSurveys
}

const getSurveysForTeacher = async (organisationCode, userId) => {
  const organisation = await Organisation.findOne({
    where: {
      code: organisationCode,
    },
    attributes: ['id'],
  })

  const organisationSurveys = await getSurveysForOrganisation(organisation.id)

  const userSurveys = organisationSurveys.filter(({ userFeedbackTargets }) =>
    userFeedbackTargets.some(({ userId: id, accessStatus }) => id === userId && accessStatus === 'RESPONSIBLE_TEACHER')
  )

  return userSurveys
}

const getDeletionAllowed = async organisationSurveyId => {
  const { feedbackCount } = await FeedbackTarget.findByPk(organisationSurveyId)

  return feedbackCount === 0
}

const updateUserFeedbackTargets = async (feedbackTargetId, userIds, accessStatus) => {
  await UserFeedbackTarget.destroy({
    where: {
      feedbackTargetId,
      userId: { [Op.notIn]: userIds },
      accessStatus,
    },
  })

  const existingUserIds = (await getUserFeedbackTargets(feedbackTargetId, accessStatus)).map(({ userId }) => userId)
  const newUserIds = userIds.filter(id => !existingUserIds.includes(id))

  await createUserFeedbackTargets(feedbackTargetId, newUserIds, accessStatus)
}

const getOrganisationSurveyCourseStudents = async courseIds => {
  if (!courseIds || courseIds.length === 0) return []
  const students = await User.findAll({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          accessStatus: 'STUDENT',
        },
        attributes: ['id'],
        include: [
          {
            model: FeedbackTarget,
            as: 'feedbackTarget',
            required: true,
            where: {
              courseRealisationId: { [Op.in]: courseIds },
            },
            attributes: ['id', 'courseRealisationId'],
          },
        ],
      },
    ],
    attributes: ['id', 'studentNumber'],
  })

  return students
}

const createOrganisationSurveyCourses = async (feedbackTargetId, students) => {
  const studentObjects = students.map(s => ({
    feedbackTargetId,
    courseRealisationId: s.userFeedbackTargets[0].feedbackTarget.courseRealisationId,
    userFeedbackTargetId: s.userFeedbackTargets[0].id,
  }))
  await OrganisationSurveyCourse.bulkCreate(studentObjects)
}

const updateOrganisationSurvey = async (feedbackTargetId, updates) => {
  const { name, teacherIds, studentNumbers, courseIds } = updates

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  const { startDate, endDate } = formatActivityPeriod(updates) ?? feedbackTarget

  await feedbackTarget.update({
    name,
    opensAt: startDate,
    closesAt: endDate,
  })

  const courseRealisation = await CourseRealisation.findByPk(feedbackTarget.courseRealisationId)

  await courseRealisation.update({
    name,
    startDate,
    endDate,
  })

  if (teacherIds) {
    await updateUserFeedbackTargets(feedbackTargetId, teacherIds, 'RESPONSIBLE_TEACHER')
  }

  if (studentNumbers) {
    const studentIds = await getStudentIds(studentNumbers)

    await updateUserFeedbackTargets(feedbackTargetId, studentIds, 'STUDENT')
  }

  if (courseIds) {
    const studentDataFromCourseIds = await getOrganisationSurveyCourseStudents(courseIds)

    await updateUserFeedbackTargets(feedbackTargetId, studentDataFromCourseIds, 'STUDENT')

    await createOrganisationSurveyCourses(feedbackTargetId, studentDataFromCourseIds)
  }

  const survey = await getSurveyById(feedbackTargetId)

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

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw err
  }
}

module.exports = {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  createUserFeedbackTargets,
  getStudentIds,
  getSurveyById,
  getSurveysForOrganisation,
  getSurveysForTeacher,
  getDeletionAllowed,
  updateOrganisationSurvey,
  deleteOrganisationSurvey,
  getOrganisationSurveyCourseStudents,
  createOrganisationSurveyCourses,
}
