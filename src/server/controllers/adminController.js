const Router = require('express')

const { Op } = require('sequelize')
const { ApplicationError } = require('../util/customErrors')
const importerClient = require('../util/importerClient')
const { ADMINS } = require('../util/config')
const { FeedbackTarget, CourseRealisation } = require('../models')

const adminAccess = (req, _, next) => {
  const { uid: username } = req.headers
  if (!ADMINS.includes(username)) throw new ApplicationError('Forbidden', 403)

  return next()
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

const getFeedbackTargets = async (req, res) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.gte]: new Date(2020, 10, 10),
      },
    },
    include: {
      model: CourseRealisation,
      as: 'courseRealisation',
    },
  })

  res.send(feedbackTargets)
}

const router = Router()

router.use(adminAccess)

router.get('/users', findUser)
router.get('/feedback-targets', getFeedbackTargets)

module.exports = router
