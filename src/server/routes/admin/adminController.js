const Router = require('express')

const { Op } = require('sequelize')
const _ = require('lodash')
const { format, subMonths } = require('date-fns')

const { ApplicationError } = require('../../util/customErrors')
const updaterClient = require('../../util/updaterClient')

const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  UserFeedbackTarget,
  User,
  UpdaterStatus,
  Organisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  InactiveCourseRealisation,
  Banner,
} = require('../../models')

const { sequelize } = require('../../db/dbConnection')
const { logger } = require('../../util/logger')

const { mailer } = require('../../mailer')
const { adminAccess } = require('../../middleware/adminAccess')
const { buildSummaries } = require('../../services/summary/buildSummaries')

const runUpdater = async (_, res) => {
  logger.info('Running updater on demand')
  await updaterClient.run()
  return res.send({})
}

const runUpdaterForEnrolmentsOfCourse = async (req, res) => {
  const curId = req.params?.courseRealisationId
  if (!curId) return res.sendStatus(400)

  try {
    await updaterClient.updateEnrolments(curId)
  } catch (error) {
    if (error?.response) {
      res.status(error.response.status).send(error.response.data)
    }
  }

  return res.send({})
}

const getUpdaterStatuses = async (req, res) => {
  const { jobType } = req.query
  const statuses = await UpdaterStatus.findAll({
    where: jobType !== 'ALL' ? { jobType } : {},
    order: [['startedAt', 'desc']],
    limit: 50,
  })
  return res.send(statuses)
}

const runPate = async (_, res) => {
  await mailer.runPateCron()
  return res.sendStatus(204)
}

const findUser = async (req, res) => {
  const {
    query: { user },
  } = req

  let params = {}
  let where = {}

  if (user.split(' ').length === 2) {
    const firstName = user.split(' ')[0]
    const lastName = user.split(' ')[1]
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
    const isEmail = user.includes('.') || user.includes('@')
    const isStudentNumber = !Number.isNaN(Number(user))
    const isSisuId = !isStudentNumber && !Number.isNaN(Number(user[user.length - 1]))
    const isUsername = !isStudentNumber && !isSisuId

    if (isEmail) {
      where[Op.or] = {
        email: { [Op.iLike]: `${user}%` },
        secondaryEmail: { [Op.iLike]: `${user}%` },
      }
      params.email = user
    } else if (isStudentNumber) {
      where.studentNumber = {
        [Op.iLike]: `${user}%`,
      }
      params.studentNumber = user
    } else if (isSisuId) {
      where.id = {
        [Op.iLike]: `${user}%`,
      }
      params.id = user
    } else if (isUsername) {
      where.username = {
        [Op.iLike]: `%${user}%`,
      }
      params.username = user
    }
  }

  const { rows: persons, count } = await User.findAndCountAll({
    where,
    limit: 20,
  })

  return res.send({
    params,
    persons: persons.map(person => ({
      ...person.dataValues,
    })),
    count,
  })
}

const findFeedbackTargets = async (req, res) => {
  const {
    query: { id, code, name, language },
  } = req
  const params = {}

  const include = [
    {
      model: CourseUnit,
      attributes: ['courseCode', 'name'],
      as: 'courseUnit',
      required: true,
      include: {
        model: Organisation,
        as: 'organisations',
        attributes: ['id', 'code', 'name'],
        through: { model: CourseUnitsOrganisation },
      },
    },
    {
      model: CourseRealisation,
      attributes: ['startDate', 'endDate', 'name'],
      as: 'courseRealisation',
      required: true,
      include: {
        model: Organisation,
        as: 'organisations',
        attributes: ['id', 'code', 'name'],
        through: { model: CourseRealisationsOrganisation },
      },
    },
  ]

  const numberId = Number(id)
  if (numberId) {
    const result = await FeedbackTarget.findByPk(numberId, { include })
    params.id = numberId
    return res.send({
      params,
      feedbackTargets: result ? [result.toJSON()] : [],
    })
  }

  if (code) {
    include[0].where = { courseCode: { [Op.iLike]: `${code}%` } }
  }
  if (name?.length > 2) {
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
  return res.send({
    params,
    count,
    feedbackTargets: result.map(r => r.toJSON()),
  })
}

const findOrganisationSurveys = async (req, res) => {
  const {
    query: { id, orgCode, name, language },
  } = req
  const params = {}

  const include = [
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
      include: {
        model: Organisation,
        as: 'organisations',
        attributes: ['id', 'code', 'name'],
        through: { model: CourseRealisationsOrganisation },
      },
      ...(name?.length > 2 && {
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
  ]

  const numberId = Number(id)
  if (numberId) {
    const result = await FeedbackTarget.findByPk(numberId, { include })
    params.id = numberId
    return res.send({
      params,
      feedbackTargets: result ? [result.toJSON()] : [],
    })
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

  return res.send({
    params,
    count: organisationSurveyCount,
    feedbackTargets: organisationSurveys,
  })
}

const resendFeedbackResponseEmail = async (req, res) => {
  const { id } = req.body
  const idNumber = Number(id)
  if (!idNumber) throw new ApplicationError('Invalid id', 400)
  const feedbackTarget = await FeedbackTarget.findByPk(idNumber)
  if (!feedbackTarget) throw new ApplicationError('Not found', 404)
  const emailsSentTo = await mailer.sendFeedbackSummaryReminderToStudents(
    feedbackTarget,
    feedbackTarget.feedbackResponse
  )
  return res.send({ count: emailsSentTo.length })
}

const formatFeedbackTargets = async feedbackTargets => {
  const convertSingle = async feedbackTarget => feedbackTarget.toPublicObject()

  if (!Array.isArray(feedbackTargets)) return convertSingle(feedbackTargets)

  const responseReady = []

  // eslint-disable-next-line
  for (const feedbackTarget of feedbackTargets) {
    if (feedbackTarget) {
      // eslint-disable-next-line
      responseReady.push(await convertSingle(feedbackTarget))
    }
  }
  /* eslint-enable */

  return responseReady
}

const getFeedbackTargets = async (req, res) => {
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
    studentFeedbackTargets.map(target => parseInt(target.get('feedbackCount'), 10))
  )

  const formattedFeedbackTargets = await formatFeedbackTargets(feedbackTargets)

  const feedbackTargetsWithCount = formattedFeedbackTargets.map(target => ({
    ...target,
    feedbackCount: feedbackCountByFeedbackTargetId[target.id] ?? 0,
  }))

  return res.send(feedbackTargetsWithCount)
}

const findEmailsForToday = async (_, res) => {
  const { students, teachers, teacherEmailCounts, studentEmailCounts } = await mailer.returnEmailsToBeSentToday()

  const emails = students.concat(teachers)
  return res.send({
    emails,
    studentEmails: students.length,
    teacherEmails: teachers.length,
    teacherEmailCounts,
    studentEmailCounts,
  })
}

const getNorppaStatistics = async (req, res) => {
  const { opensAt, closesAt } = req.query

  const results = await sequelize.query(
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

      type: sequelize.QueryTypes.SELECT,
    }
  )

  const resultsWithBetterNames = results.map(r => ({
    ...r,
    start_date: format(r.start_date, 'dd.MM.yyyy'),
    end_date: format(r.end_date, 'dd.MM.yyyy'),
    organisation_name: r.organisation_name.fi,
    parent_name: r.parent_name.fi,
    name: r.name.en ? r.name.en : r.name[0],
  }))

  const resultsWithBetterAvoin = resultsWithBetterNames.filter(r => r.organisation_name !== 'Lukuvuosi')

  return res.send(resultsWithBetterAvoin)
}

const createBanner = async (req, res) => {
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

  return res.send(banner)
}

const updateBanner = async (req, res) => {
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

  return res.send(banner)
}

const deleteBanner = async (req, res) => {
  const { id } = req.params
  const destroyed = await Banner.destroy({ where: { id } })
  if (!destroyed) {
    throw new ApplicationError('Not found', 404)
  }
  return res.send(200)
}

const getFeedbackCorrespondents = async (req, res) => {
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
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return res.send(users)
}

const getInactiveCourseRealisations = async (req, res) => {
  const inactiveCourseRealisations = await InactiveCourseRealisation.findAll({
    where: {
      endDate: {
        [Op.gt]: subMonths(new Date(), 3),
      },
    },
  })

  return res.send(inactiveCourseRealisations)
}

const updateInactiveCourseRealisation = async (req, res) => {
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

  return res.send(inactiveCourse)
}

const getNodeConfigEnv = (_req, res) => {
  const { NODE_CONFIG_ENV } = process.env
  return res.send({ NODE_CONFIG_ENV })
}

const updateSummariesTable = async (req, res) => {
  const { forceAll } = req.body
  logger.info('Starting to update summaries table')

  const start = Date.now()
  await buildSummaries(forceAll) // force all determines if the summaries are completely rebuilt
  const duration = Date.now() - start

  return res.send({ duration })
}

const router = Router()

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
module.exports = router
