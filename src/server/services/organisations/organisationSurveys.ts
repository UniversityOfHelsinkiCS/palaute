import { addYears } from 'date-fns'
import { LocalizedString } from '@common/types/common'
import { Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { i18n } from '../../util/i18n'

import { logger } from '../../util/logger'
import { formatActivityPeriod } from '../../util/common'
import { sequelize } from '../../db/dbConnection'
import { LANGUAGES } from '../../util/config'
import {
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
  Summary,
} from '../../models'
import cache from '../feedbackTargets/feedbackTargetCache'
import { getFeedbackTargetSurveys } from '../surveys/getFeedbackTargetSurveys'
import { AccessStatus } from '../../models/userFeedbackTarget'

const getOrganisationCourseUnit = async (organisationId: string) => {
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

const getCourseUnitName = (organisationName: LocalizedString) => {
  const name: LocalizedString = {}

  LANGUAGES.forEach((language: keyof LocalizedString) => {
    const t = i18n.getFixedT(language)
    name[language] = `${organisationName[language]}: ${t('organisationSurveys:surveys')}`
  })

  return name
}

export const initializeOrganisationCourseUnit = async (organisation: Organisation) => {
  const existingOrganisationCU = await getOrganisationCourseUnit(organisation.id)

  if (existingOrganisationCU) return

  const startDate = new Date()
  const endDate = addYears(new Date(), 9999)

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

export const createOrganisationFeedbackTarget = async (organisation: Organisation, feedbackTargetData: any) => {
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

export const getStudentIds = async (studentNumbers: string[]) => {
  const students = await User.findAll({
    where: {
      studentNumber: { [Op.in]: studentNumbers },
    },
    attributes: ['id'],
  })

  const studentIds = students.map(({ id }) => id)

  return studentIds
}

export const createUserFeedbackTargets = async (
  feedbackTargetId: number,
  userIds: string[],
  accessStatus: AccessStatus
) => {
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

const getUserFeedbackTargets = async (feedbackTargetId: number, accessStatus: string) => {
  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus,
    },
    attributes: ['id', 'userId'],
  })

  return userFeedbackTargets
}

export const getOrganisationSurveyCourseStudents = async (courseRealisationIds: string[]) => {
  if (!courseRealisationIds || courseRealisationIds.length === 0) return []
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
              userCreated: false,
              courseRealisationId: { [Op.in]: courseRealisationIds },
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

const getFeedbackTargetStudentCountForCourseRealisation = async (courseRealisationId: string) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: ['id'],
    where: {
      courseRealisationId,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: Summary,
        as: 'summary',
      },
    ],
  })

  const studentCount = feedbackTargets[0]?.summary?.data?.studentCount || 1

  return studentCount
}

export const getSurveyById = async (feedbackTargetId: number) => {
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
        attributes: ['id', 'accessStatus'],
        as: 'userFeedbackTargets',
        required: false,
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      },
    ],
  })

  if (!organisationSurvey) throw new Error('Organisation survey not found')

  const courseRealisationIds = await OrganisationSurveyCourse.findAll({
    where: {
      feedbackTargetId,
    },
    attributes: ['courseRealisationId', 'userFeedbackTargetId'],
  })

  if (!courseRealisationIds) throw new Error('Course realisation IDs not found')

  const courseStudents = await getOrganisationSurveyCourseStudents(
    courseRealisationIds.map(({ courseRealisationId }) => courseRealisationId)
  )

  const courses = await CourseRealisation.findAll({
    where: {
      id: { [Op.in]: courseRealisationIds.map(({ courseRealisationId }) => courseRealisationId) },
    },
    attributes: ['id', 'name', 'startDate', 'endDate'],
  })
  const courseStudentNumbers = new Set(courseStudents.map(student => student.studentNumber))

  const students = organisationSurvey.userFeedbackTargets.filter(({ accessStatus }) => accessStatus === 'STUDENT')
  organisationSurvey.dataValues.userFeedbackTargets = organisationSurvey.userFeedbackTargets.filter(
    ({ accessStatus }) => accessStatus === 'RESPONSIBLE_TEACHER'
  )
  const independentStudents = students.filter(({ user }) => !courseStudentNumbers.has(user.studentNumber))

  const coursesWithStudentCounts = await Promise.all(
    courses.map(async course => {
      const studentCount = await getFeedbackTargetStudentCountForCourseRealisation(course.id)
      return { ...course.dataValues, studentCount }
    })
  )

  return {
    ...organisationSurvey.dataValues,
    students: {
      independentStudents,
      courseStudents,
    },
    courses: coursesWithStudentCounts,
  }
}

export const getSurveysForOrganisation = async (organisationId: string) => {
  const organisationSurveys = await FeedbackTarget.findAll({
    attributes: [
      'id',
      'courseUnitId',
      'courseRealisationId',
      'name',
      'hidden',
      'feedbackType',
      'publicQuestionIds',
      'feedbackResponse',
      'feedbackResponseEmailSent',
      'opensAt',
      'closesAt',
      'userCreated',
    ],
    include: [
      {
        model: Summary,
        as: 'summary',
        required: false,
      },
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
        include: [
          {
            model: User,
            attributes: ['studentNumber'],
            as: 'user',
          },
        ],
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id', 'userId', 'accessStatus'],
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'RESPONSIBLE_TEACHER',
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      },
    ],
    order: [['courseRealisation', 'endDate', 'DESC']],
  })

  for (const target of organisationSurveys) {
    const surveys = await getFeedbackTargetSurveys(target)
    target.populateSurveys(surveys)
  }

  return organisationSurveys
}

export const getSurveysForTeacher = async (organisationCode: string, userId: string) => {
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

export const getDeletionAllowed = async (organisationSurveyId: number) => {
  const feedbackCount = await UserFeedbackTarget.count({
    where: {
      feedbackTargetId: organisationSurveyId,
      [Op.not]: { feedbackId: null },
    },
  })

  return feedbackCount === 0
}

export const updateUserFeedbackTargets = async (
  feedbackTargetId: number,
  userIds: string[],
  accessStatus: AccessStatus
) => {
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

export const createOrganisationSurveyCourses = async (feedbackTargetId: number, students: any[]) => {
  const studentObjects = students.map(s => ({
    feedbackTargetId,
    courseRealisationId: s.userFeedbackTargets[0].feedbackTarget.courseRealisationId,
    userFeedbackTargetId: s.userFeedbackTargets[0].id,
  }))
  await OrganisationSurveyCourse.bulkCreate(studentObjects)
}

export const updateOrganisationSurveyCourses = async (feedbackTargetId: number, students: any[]) => {
  await OrganisationSurveyCourse.destroy({
    where: {
      feedbackTargetId,
    },
  })

  await createOrganisationSurveyCourses(feedbackTargetId, students)
}

export const updateOrganisationSurvey = async (
  feedbackTargetId: number,
  updates: {
    name?: LocalizedString
    teacherIds?: string[]
    studentNumbers?: string[]
    courseRealisationIds?: string[]
    startDate: string
    endDate: string
  }
) => {
  const { name, teacherIds, studentNumbers, courseRealisationIds } = updates

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  const { startDate, endDate } = formatActivityPeriod(updates)

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

  let studentIds: string[] = []

  if (studentNumbers) {
    studentIds = await getStudentIds(studentNumbers)
  }

  if (courseRealisationIds) {
    const studentDataFromCourseIds = await getOrganisationSurveyCourseStudents(courseRealisationIds)
    const studentIdsFromCourseIds = studentDataFromCourseIds.map(student => student.id)
    studentIds = [...new Set([...studentIds, ...studentIdsFromCourseIds])]
    await updateOrganisationSurveyCourses(feedbackTargetId, studentDataFromCourseIds)
  }

  // updating student feedback targets even when studentNumbers are empty
  if (studentIds.length >= 0) {
    await updateUserFeedbackTargets(feedbackTargetId, studentIds, 'STUDENT')
  }

  cache.invalidate(feedbackTargetId)

  const survey = await getSurveyById(feedbackTargetId)

  return survey
}

export const deleteOrganisationSurvey = async (feedbackTargetId: number) => {
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

    const orgSurveyCourse = await OrganisationSurveyCourse.destroy({
      where: {
        feedbackTargetId,
      },
    })

    logger.info(`Deleted ${orgSurveyCourse} organisation survey courses`)

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw err
  }
}
