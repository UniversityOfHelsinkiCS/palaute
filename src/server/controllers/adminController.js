const Router = require('express')

const { Op } = require('sequelize')
const _ = require('lodash')
const { format } = require('date-fns')

const { ApplicationError } = require('../util/customErrors')
const { ADMINS } = require('../util/config')
const { run } = require('../updater/index')

const {
  FeedbackTarget,
  Feedback,
  CourseRealisation,
  CourseUnit,
  UserFeedbackTarget,
  User,
} = require('../models')

const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')

const { returnEmailsToBeSentToday } = require('../util/emailSender')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers

  if (!ADMINS.includes(username)) throw new ApplicationError('Forbidden', 403)

  return next()
}

const runUpdater = async (_, res) => {
  logger.info('Running updater on demand')
  run()
  res.send({})
}

const findUser = async (req, res) => {
  const {
    query: { user },
  } = req
  if (user.split(' ').length === 2) {
    const firstName = user.split(' ')[0]
    const lastName = user.split(' ')[1]
    const persons = await User.findAll({
      where: {
        firstName: {
          [Op.iLike]: `%${firstName}%`,
        },
        lastName: {
          [Op.iLike]: `%${lastName}%`,
        },
      },
      limit: 100,
    })
    return res.send({
      params: {
        firstName,
        lastName,
      },
      persons: persons.map((person) => ({
        ...person.dataValues,
        firstNames: person.firstName,
      })),
    })
  }
  const isEmployeeNumber = !Number.isNaN(Number(user)) && user.charAt(0) !== '0'
  const isStudentNumber = !isEmployeeNumber && !Number.isNaN(Number(user))
  const isSisuId =
    !isEmployeeNumber &&
    !isStudentNumber &&
    !Number.isNaN(Number(user[user.length - 1]))
  const isUsername = !isStudentNumber && !isSisuId && !isEmployeeNumber

  const params = {}
  const where = {}
  if (isStudentNumber) {
    where.studentNumber = {
      [Op.iLike]: `${user}%`,
    }
    params.studentNumber = user
  } else if (isSisuId) {
    where.id = {
      [Op.iLike]: `${user}%`,
    }
    params.id = user
  } else if (isEmployeeNumber) {
    where.employeeNumber = {
      [Op.iLike]: `${user}%`,
    }
    params.employeeNumber = user
  } else if (isUsername) {
    where.username = {
      [Op.iLike]: `%${user}%`,
    }
    params.username = user
  }

  const persons = await User.findAll({
    where,
    limit: 100,
  })

  return res.send({
    params,
    persons: persons.map((person) => ({
      ...person.dataValues,
      firstNames: person.firstName,
    })),
  })
}

const formatFeedbackTargets = async (feedbackTargets) => {
  const convertSingle = async (feedbackTarget) =>
    feedbackTarget.toPublicObject()

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
    attributes: [
      'feedbackTargetId',
      [sequelize.fn('COUNT', 'feedbackTargetId'), 'feedbackCount'],
    ],
  })

  const feedbackCountByFeedbackTargetId = _.zipObject(
    studentFeedbackTargets.map((target) => target.get('feedbackTargetId')),
    studentFeedbackTargets.map((target) =>
      parseInt(target.get('feedbackCount'), 10),
    ),
  )

  const formattedFeedbackTargets = await formatFeedbackTargets(feedbackTargets)

  const feedbackTargetsWithCount = formattedFeedbackTargets.map((target) => ({
    ...target,
    feedbackCount: feedbackCountByFeedbackTargetId[target.id] ?? 0,
  }))

  res.send(feedbackTargetsWithCount)
}

const resetTestCourse = async (_, res) => {
  const feedbackTarget = await FeedbackTarget.findOne({
    where: {
      courseUnitId: 'hy-cu-test',
    },
  })
  if (feedbackTarget) {
    const userFeedbackTargets = await UserFeedbackTarget.findAll({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })
    await userFeedbackTargets.reduce(async (p, uft) => {
      await p
      if (uft.feedbackId) {
        await Feedback.destroy({
          where: {
            id: uft.feedbackId,
          },
        })
      }
    }, Promise.resolve())
    await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    })
  }
  await FeedbackTarget.destroy({
    where: {
      courseUnitId: 'hy-cu-test',
    },
  })
  await FeedbackTarget.create({
    feedbackType: 'courseRealisation',
    typeId: 'hy-cur-test',
    courseUnitId: 'hy-cu-test',
    courseRealisationId: 'hy-cur-test',
    name: {
      fi: '-',
    },
    hidden: false,
    opensAt: '2021-08-01',
    closesAt: '2021-09-01',
  })
  const newTarget = await FeedbackTarget.findOne({
    where: {
      courseUnitId: 'hy-cu-test',
    },
  })
  await UserFeedbackTarget.create({
    feedbackTargetId: newTarget.id,
    accessStatus: 'TEACHER',
    userId: 'hy-hlo-1441871', // mluukkai
  })
  await UserFeedbackTarget.create({
    feedbackTargetId: newTarget.id,
    accessStatus: 'STUDENT',
    userId: 'hy-hlo-135680147', // varisleo
  })
  res.send({})
}

const findEmailsForToday = async (_, res) => {
  const { students, teachers, teacherEmailCounts, studentEmailCounts } =
    await returnEmailsToBeSentToday()

  const emails = students.concat(teachers)
  res.send({
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
    c.start_date,
    c.end_date,
    cu.course_code,
    CASE WHEN f.feedback_response IS null THEN false ELSE true END AS feedback_response_given
    FROM feedback_targets f
    INNER JOIN user_feedback_targets u ON f.id = u.feedback_target_id
    INNER JOIN course_realisations c ON f.course_realisation_id = c.id
    INNER JOIN course_units cu ON f.course_unit_id = cu.id
    WHERE opens_at > :opensAt
    AND closes_at < :closesAt
    AND feedback_type = 'courseRealisation'
    AND u.access_status != 'TEACHER'
    GROUP BY f.id, c.start_date, c.end_date, cu.course_code;
    `,
    {
      replacements: {
        opensAt,
        closesAt,
      },

      type: sequelize.QueryTypes.SELECT,
    },
  )

  const resultsWithBetterDates = results.map((r) => ({
    ...r,
    start_date: format(r.start_date, 'dd.MM.yyyy'),
    end_date: format(r.end_date, 'dd.MM.yyyy'),
  }))

  res.send(resultsWithBetterDates)
}

const router = Router()

router.use(adminAccess)

router.get('/users', findUser)
router.get('/feedback-targets', getFeedbackTargets)
router.post('/run-updater', runUpdater)
router.post('/reset-course', resetTestCourse)
router.get('/emails', findEmailsForToday)
router.get('/norppa-statistics', getNorppaStatistics)

module.exports = router
