import Router, { Response } from 'express'

import { IncludeOptions, Op, QueryTypes, WhereOptions } from 'sequelize'
import { LocalizedString } from '@common/types/common'
import _ from 'lodash'
import { format, subMonths } from 'date-fns'

import { ApplicationError } from '../../util/ApplicationError'
import updaterClient from '../../util/updaterClient'

import {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  UserFeedbackTarget,
  User,
  UpdaterStatus,
  Organisation,
  InactiveCourseRealisation,
  Banner,
} from '../../models'

import { sequelize } from '../../db/dbConnection'
import { logger } from '../../util/logger'

import { mailer } from '../../mailer'
import { adminAccess } from '../../middleware/adminAccess'
import { buildSummaries } from '../../services/summary/buildSummaries'
import { AuthenticatedRequest } from '../../types'
import { getLanguageValue } from '../../util/languageUtils'

const runUpdater = async (req: AuthenticatedRequest, res: Response) => {
  logger.info('Running updater on demand')
  await updaterClient.run()
  res.send({})
}

const runUpdaterForEnrolmentsOfCourse = async (req: AuthenticatedRequest, res: Response) => {
  const curId = req.params?.courseRealisationId
  if (!curId) {
    res.sendStatus(400)
    return
  }

  try {
    await updaterClient.updateEnrolments(curId)
  } catch (error) {
    if (error?.response) {
      res.status(error.response.status).send(error.response.data)
    }
  }

  res.send({})
}

const getUpdaterStatuses = async (req: AuthenticatedRequest, res: Response) => {
  const { jobType } = req.query
  const statuses = await UpdaterStatus.findAll({
    where: jobType !== 'ALL' ? { jobType: jobType as string } : {},
    order: [['startedAt', 'desc']],
    limit: 50,
  })
  res.send(statuses)
}

const runPate = async (req: AuthenticatedRequest, res: Response) => {
  await mailer.runPateCron()
  res.sendStatus(204)
}

const findUser = async (req: AuthenticatedRequest, res: Response) => {
  const userQuery = req.query.user as string

  let params: Record<string, string> = {}
  let where: WhereOptions<User> = {}

  if (userQuery.split(' ').length === 2) {
    const firstName = userQuery.split(' ')[0]
    const lastName = userQuery.split(' ')[1]
    params = { firstName, lastName }
    where = {
      firstName: {
        [Op.iLike]: `%${firstName}%`,
      },
      lastName: {
        [Op.iLike]: `%${lastName}%`,
      },
    }
  } else {
    const isEmail = userQuery.includes('.') || userQuery.includes('@')
    const isStudentNumber = !Number.isNaN(Number(userQuery))
    const isSisuId = !isStudentNumber && !Number.isNaN(Number(userQuery[userQuery.length - 1]))
    const isUsername = !isStudentNumber && !isSisuId

    if (isEmail) {
      where = {
        ...where,
        [Op.or]: [{ email: { [Op.iLike]: `${userQuery}%` } }, { secondaryEmail: { [Op.iLike]: `${userQuery}%` } }],
      }
      params.email = userQuery
    } else if (isStudentNumber) {
      where.studentNumber = {
        [Op.iLike]: `${userQuery}%`,
      }
      params.studentNumber = userQuery
    } else if (isSisuId) {
      where.id = {
        [Op.iLike]: `${userQuery}%`,
      }
      params.id = userQuery
    } else if (isUsername) {
      where.username = {
        [Op.iLike]: `%${userQuery}%`,
      }
      params.username = userQuery
    }
  }

  const { rows: persons, count } = await User.findAndCountAll({
    where,
    limit: 20,
  })

  res.send({
    params,
    persons: persons.map(person => ({
      ...person.dataValues,
    })),
    count,
  })
}

const findFeedbackTargets = async (req: AuthenticatedRequest, res: Response) => {
  const {
    query: { id, code, name, language },
  } = req
  const params: Record<string, unknown> = {}
  const nameLength = (name.length ?? 0) as number

  const include: IncludeOptions[] = [
    {
      model: CourseUnit,
      attributes: ['courseCode', 'name'],
      as: 'courseUnit',
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'code', 'name'],
        },
      ],
    },
    {
      model: CourseRealisation,
      attributes: ['startDate', 'endDate', 'name'],
      as: 'courseRealisation',
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'code', 'name'],
        },
      ],
    },
  ]

  const numberId = Number(id)
  if (numberId) {
    const result = await FeedbackTarget.findByPk(numberId, { include })
    params.id = numberId
    res.send({
      params,
      feedbackTargets: result ? [result.toJSON()] : [],
    })
    return
  }

  if (code) {
    include[0].where = { courseCode: { [Op.iLike]: `${code}%` } }
  }
  if (nameLength > 2) {
    include[0].where = {
      [Op.or]: {
        [`name.${language}`]: { [Op.iLike]: `${name}%` },
      },
    }
  }

  const { count, rows: result } = await FeedbackTarget.findAndCountAll({
    include,
    order: [['closesAt', 'DESC']],
    limit: 10,
  })
  res.send({
    params,
    count,
    feedbackTargets: result.map(r => r.toJSON()),
  })
}

const findOrganisationSurveys = async (req: AuthenticatedRequest, res: Response) => {
  const {
    query: { id, orgCode, name, language },
  } = req
  const params: Record<string, unknown> = {}
  const nameLength = (name.length ?? 0) as number

  const include: IncludeOptions[] = [
    {
      model: CourseUnit,
      as: 'courseUnit',
      attributes: ['courseCode', 'name'],
      where: {
        userCreated: true,
      },
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'code', 'name'],
          through: { attributes: ['type'], as: 'courseUnitOrganisation' },
          required: true,
          ...(orgCode && { where: { code: { [Op.iLike]: `${orgCode}%` } } }),
        },
      ],
    },
    {
      model: CourseRealisation,
      as: 'courseRealisation',
      attributes: ['startDate', 'endDate', 'name'],
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'code', 'name'],
        },
      ],
      ...(nameLength > 2 && {
        where: {
          [Op.or]: {
            [`name.${language}`]: { [Op.iLike]: `${name}%` },
          },
        },
      }),
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
  ]

  const numberId = Number(id)
  if (numberId) {
    const result = await FeedbackTarget.findByPk(numberId, { include })
    params.id = numberId
    res.send({
      params,
      feedbackTargets: result ? [result.toJSON()] : [],
    })
    return
  }

  const organisationSurveys = await FeedbackTarget.findAll({
    where: {
      userCreated: true,
    },
    include,
    order: [['closesAt', 'DESC']],
  })

  const organisationSurveyCount = await FeedbackTarget.count({
    where: {
      userCreated: true,
    },
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id'],
        where: {
          userCreated: true,
        },
        required: true,
      },
    ],
  })

  res.send({
    params,
    count: organisationSurveyCount,
    feedbackTargets: organisationSurveys,
  })
}

const resendFeedbackResponseEmail = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.body
  const idNumber = Number(id)
  if (!idNumber) throw new ApplicationError('Invalid id', 400)
  const feedbackTarget = await FeedbackTarget.findByPk(idNumber)
  if (!feedbackTarget) throw new ApplicationError('Not found', 404)
  const emailsSentTo = await mailer.sendFeedbackSummaryReminderToStudents(
    feedbackTarget,
    feedbackTarget.feedbackResponse
  )
  res.send({ count: emailsSentTo.length })
}

const formatFeedbackTargets = async (feedbackTargets: FeedbackTarget | FeedbackTarget[]) => {
  if (!Array.isArray(feedbackTargets)) return [feedbackTargets.toPublicObject()]

  const responseReady = []

  for (const feedbackTarget of feedbackTargets) {
    if (feedbackTarget) {
      responseReady.push(feedbackTarget.toPublicObject())
    }
  }

  return responseReady
}

const getFeedbackTargets = async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.gte]: new Date(2020, 10, 10),
      },
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
      },
    ],
  })

  const feedbackTargetIds = feedbackTargets.map(({ id }) => id)

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId: {
        [Op.in]: feedbackTargetIds,
      },
      accessStatus: 'STUDENT',
      feedbackId: {
        [Op.ne]: null,
      },
    },
    group: ['feedbackTargetId'],
    attributes: ['feedbackTargetId', [sequelize.fn('COUNT', 'feedbackTargetId'), 'feedbackCount']],
  })

  const feedbackCountByFeedbackTargetId = _.zipObject(
    studentFeedbackTargets.map(target => target.get('feedbackTargetId')),
    studentFeedbackTargets.map(target => parseInt(target.get('feedbackCount') as string, 10))
  )

  const formattedFeedbackTargets = await formatFeedbackTargets(feedbackTargets)

  const feedbackTargetsWithCount = formattedFeedbackTargets.map(target => ({
    ...target,
    feedbackCount: feedbackCountByFeedbackTargetId[target.id] ?? 0,
  }))

  res.send(feedbackTargetsWithCount)
}

const findEmailsForToday = async (req: AuthenticatedRequest, res: Response) => {
  const { students, teachers, teacherEmailCounts, studentEmailCounts } = await mailer.returnEmailsToBeSentToday()

  const emails = teachers.concat(students)
  res.send({
    emails,
    studentEmails: students.length,
    teacherEmails: teachers.length,
    teacherEmailCounts,
    studentEmailCounts,
  })
}

const getNorppaStatistics = async (req: AuthenticatedRequest, res: Response) => {
  const { opensAt, closesAt } = req.query

  const results = await sequelize.query<{
    id: number
    ufbts: number
    feedbacks: number
    name: LocalizedString
    course_code: string
    start_date: Date
    end_date: Date
    feedback_response_given: boolean
    organisation_name: LocalizedString
    organisation_code: string
    parent_name: LocalizedString
  }>(
    `SELECT

    DISTINCT f.id,
    COUNT (DISTINCT u.id) AS ufbts,
    COUNT (u.feedback_id) AS feedbacks,
    cu.name,
    cu.course_code,
    c.start_date,
    c.end_date,
    CASE WHEN f.feedback_response IS null THEN false ELSE true END AS feedback_response_given,
    org.name as organisation_name,
    org.code as organisation_code,
    parentorg.name as parent_name

    FROM feedback_targets f

    INNER JOIN user_feedback_targets u ON f.id = u.feedback_target_id
    INNER JOIN course_realisations c ON f.course_realisation_id = c.id
    INNER JOIN course_units cu ON f.course_unit_id = cu.id
    INNER JOIN course_realisations_organisations cuo ON cuo.course_realisation_id = c.id
    INNER JOIN organisations org ON org.id = cuo.organisation_id
    INNER JOIN organisations parentorg ON parentorg.id = org.parent_id

    WHERE opens_at > :opensAt
    AND closes_at < :closesAt
    AND feedback_type = 'courseRealisation'
    AND NOT is_teacher(u.access_status)
    GROUP BY f.id, cu.name, cu.course_code, c.start_date, c.end_date, org.id, parentorg.id;
    `,
    {
      replacements: {
        opensAt,
        closesAt,
      },

      type: QueryTypes.SELECT,
    }
  )

  const resultsWithBetterNames = results.map(r => ({
    ...r,
    start_date: format(r.start_date, 'dd.MM.yyyy'),
    end_date: format(r.end_date, 'dd.MM.yyyy'),
    organisation_name: r.organisation_name.fi,
    parent_name: r.parent_name.fi,
    name: getLanguageValue(r.name, 'en'),
  }))

  const resultsWithBetterAvoin = resultsWithBetterNames.filter(r => r.organisation_name !== 'Lukuvuosi')

  res.send(resultsWithBetterAvoin)
}

const createBanner = async (req: AuthenticatedRequest, res: Response) => {
  const { body } = req

  const banner = Banner.build({
    data: { text: body.data.text, color: body.data.color },
    accessGroup: body.accessGroup,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  })

  try {
    await banner.save()
  } catch (err) {
    throw new ApplicationError('Fakd', 400)
  }

  res.send(banner)
}

const updateBanner = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const { body } = req

  const banner = await Banner.findByPk(id)
  if (!banner) ApplicationError.NotFound('bannerino no existo')
  banner.data = body.data
  banner.accessGroup = body.accessGroup ?? body.accessGroup
  banner.startDate = new Date(body.startDate)
  banner.endDate = new Date(body.endDate)

  try {
    await banner.save()
  } catch (err) {
    throw new ApplicationError('Fakd', 400)
  }

  res.send(banner)
}

const deleteBanner = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const destroyed = await Banner.destroy({ where: { id } })
  if (!destroyed) {
    throw new ApplicationError('Not found', 404)
  }
  res.sendStatus(200)
}

const getFeedbackCorrespondents = async (req: AuthenticatedRequest, res: Response) => {
  const users = await sequelize.query(
    `
    SELECT 
      u.id, 
      u.email, 
      u.secondary_email as "secondaryEmail", 
      u.student_number as "studentNumber",
      u.degree_study_right as "degreeStudyRight",
      u.last_logged_in as "lastLoggedIn",
      u.username,
      u.language,
      org.name as "organisationName",
      org.code as "organisationCode",
      ofc.user_created as "userCreated"

    FROM users u
    INNER JOIN organisation_feedback_correspondents ofc ON ofc.user_id = u.id
    INNER JOIN organisations org ON org.id = ofc.organisation_id
    ORDER BY org.code
  `,
    {
      type: QueryTypes.SELECT,
    }
  )

  res.send(users)
}

const getInactiveCourseRealisations = async (req: AuthenticatedRequest, res: Response) => {
  const inactiveCourseRealisations = await InactiveCourseRealisation.findAll({
    where: {
      endDate: {
        [Op.gt]: subMonths(new Date(), 6),
      },
    },
  })

  res.send(inactiveCourseRealisations)
}

const updateInactiveCourseRealisation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const { manuallyEnabled } = req.body

  const inactiveCourse = await InactiveCourseRealisation.findByPk(id)

  if (!inactiveCourse) throw new ApplicationError('Not found', 404)

  await inactiveCourse.update(
    {
      manuallyEnabled,
    },
    { where: { id } }
  )

  if (!manuallyEnabled) await updaterClient.deleteCourse(id)

  res.send(inactiveCourse)
}

const getNodeConfigEnv = (_req: AuthenticatedRequest, res: Response) => {
  const { NODE_CONFIG_ENV } = process.env
  res.send({ NODE_CONFIG_ENV })
}

const updateSummariesTable = async (req: AuthenticatedRequest, res: Response) => {
  const { forceAll } = req.body
  logger.info('Starting to update summaries table')

  const start = Date.now()
  await buildSummaries(forceAll) // force all determines if the summaries are completely rebuilt
  const duration = Date.now() - start

  res.send({ duration })
}

const getBanners = async (req: AuthenticatedRequest, res: Response) => {
  const banners = await Banner.findAll({
    where: {
      endDate: {
        [Op.gt]: new Date(),
      },
    },
  })

  res.send(banners)
}

export const router = Router()

router.use(adminAccess)

router.get('/users', findUser)
router.get('/feedback-targets-data', getFeedbackTargets)
router.post('/run-updater', runUpdater)
router.post('/run-updater/enrolments/:courseRealisationId', runUpdaterForEnrolmentsOfCourse)
router.get('/updater-status', getUpdaterStatuses)
router.post('/run-pate', runPate)
router.get('/emails', findEmailsForToday)
router.get('/norppa-statistics', getNorppaStatistics)
router.get('/feedback-targets', findFeedbackTargets)
router.get('/organisation-surveys', findOrganisationSurveys)
router.put('/resend-response', resendFeedbackResponseEmail)
router.get('/feedback-correspondents', getFeedbackCorrespondents)
router.get('/inactive-course-realisations', getInactiveCourseRealisations)
router.put('/inactive-course-realisations/:id', updateInactiveCourseRealisation)
router.post('/banners', createBanner)
router.put('/banners/:id', updateBanner)
router.delete('/banners/:id', deleteBanner)
router.get('/node-config-env', getNodeConfigEnv)
router.post('/build-summaries', updateSummariesTable)
router.get('/banners', getBanners)
