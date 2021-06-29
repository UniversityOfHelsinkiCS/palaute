const Router = require('express')

const { Op } = require('sequelize')
const _ = require('lodash')

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
      [Op.iLike]: `%${user}%`,
    }
    params.studentNumber = user
  } else if (isSisuId) {
    where.id = {
      [Op.iLike]: `%${user}%`,
    }
    params.id = user
  } else if (isEmployeeNumber) {
    where.employeeNumber = {
      [Op.iLike]: `%${user}%`,
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
    }
  })
  if (feedbackTarget) {
    const userFeedbackTargets = await UserFeedbackTarget.findAll({
      where: {
        feedbackTargetId: feedbackTarget.id
      }
    })
    await userFeedbackTargets.reduce(async (p, uft) => {
      await p
      if (uft.feedbackId) {
        await Feedback.destroy({
          where: {
            id: uft.feedbackId,
          }
        })
      }
    }, Promise.resolve())
    await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId: feedbackTarget.id
      }
    })
  }
  await FeedbackTarget.destroy({
    where: {
      courseUnitId: 'hy-cu-test',
    }
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
    }
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

const router = Router()

router.use(adminAccess)

router.get('/users', findUser)
router.get('/feedback-targets', getFeedbackTargets)
router.post('/run-updater', runUpdater)
router.post('/reset-course', resetTestCourse)

module.exports = router
