const Router = require('express')

const { Op } = require('sequelize')
const _ = require('lodash')

const { ApplicationError } = require('../util/customErrors')
const importerClient = require('../util/importerClient')
const { ADMINS } = require('../util/config')
const { run } = require('../updater/index')

const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  UserFeedbackTarget,
} = require('../models')

const { sequelize } = require('../util/dbConnection')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers
  if (!ADMINS.includes(username)) throw new ApplicationError('Forbidden', 403)

  return next()
}

const runUpdater = async () => {
  run()
}

const findUser = async (req, res) => {
  const {
    query: { user },
  } = req

  const isEmployeeNumber = !Number.isNaN(Number(user)) && user.charAt(0) !== '0'
  const isStudentNumber = !isEmployeeNumber && !Number.isNaN(Number(user))
  const isSisuId =
    !isEmployeeNumber &&
    !isStudentNumber &&
    !Number.isNaN(Number(user[user.length - 1]))
  const isUsername = !isStudentNumber && !isSisuId && !isEmployeeNumber

  const params = {}

  if (isStudentNumber) params.studentNumber = user
  if (isSisuId) params.id = user
  if (isEmployeeNumber) params.employeeNumber = user
  if (isUsername) params.eduPersonPrincipalName = user

  const { data } = await importerClient.get(`/palaute/persons`, { params })
  const { persons } = data

  res.send({
    params,
    persons,
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

const router = Router()

router.use(adminAccess)

router.get('/users', findUser)
router.get('/feedback-targets', getFeedbackTargets)
router.post('/run-updater', runUpdater)

module.exports = router
