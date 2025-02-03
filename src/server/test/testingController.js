const Router = require('express')
const _ = require('lodash')
const morgan = require('morgan')

const { FeedbackTarget } = require('../models')

const { ApplicationError } = require('../util/customErrors')
const { initTestSummary } = require('./seedSummary')
const { seedFeedbackTargetsForTeacher } = require('./seedFeedbackTargets')
const { seedDb, seedUsers, seedOrganisationCorrespondent } = require('./seed')
const { TEST_COURSE_REALISATION_ID } = require('./testIds')
const { inProduction } = require('../util/config')
const { getUniversitySurvey } = require('../services/surveys')

const initSummary = async (req, res) => {
  await initTestSummary({ user: _.pick(req.body, ['hyPersonSisuId', 'uid']) })
  return res.send(200)
}

const userHeadersToUser = userHeaders => ({
  id: userHeaders.hyPersonSisuId,
  username: userHeaders.uid,
  firstName: userHeaders.givenname,
  lastName: userHeaders.sn,
  email: userHeaders.mail,
  employeeNumber: userHeaders.employeeNumber,
  studentNumber: userHeaders.studentNumber,
})

const seedTestUsers2 = async (req, res) => {
  const users = req.body.map(userHeadersToUser)
  await seedUsers(users)
  return res.send(201)
}

const seedOrganisationCorrespondentHandler = async (req, res) => {
  const user = userHeadersToUser(req.body.user)
  await seedOrganisationCorrespondent(user)
  return res.send(200)
}

const seedFeedbackTargets = async (req, res) => {
  const { teacher, student, opensAt, closesAt, extraStudents } = req.body
  const fbts = await seedFeedbackTargetsForTeacher({
    teacher: userHeadersToUser(teacher),
    student: userHeadersToUser(student),
    opensAt,
    closesAt,
    extraStudents,
  })
  return res.send(fbts)
}

const resetDb = async (req, res) => {
  await seedDb()
  return res.send(204)
}

const seedFeedbacks = async (req, res) => {
  const { feedbackDatas } = req.body
  await seedFeedbacks(feedbackDatas)
  return res.send(201)
}

const getTestFbtId = async (req, res) => {
  const fbt = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: TEST_COURSE_REALISATION_ID,
    },
  })

  return res.send({ id: fbt.id })
}

const getUniversityQuestions = async (req, res) => {
  const srv = await getUniversitySurvey()
  return res.send(srv.questions)
}

const router = Router()

// A double safeguard against running test routes in production. This should never happen.
router.use((_, __, next) => {
  if (inProduction) {
    throw new ApplicationError('Test router called in production.', 500)
  }
  next()
})

router.use(Router.json())
router.use(morgan('dev'))

router.post('/init-summary', initSummary)
router.post('/seed-users', seedTestUsers2)
router.post('/seed-feedback-targets', seedFeedbackTargets)
router.post('/seed-feedbacks', seedFeedbacks)
router.post('/seed-organisation-correspondent', seedOrganisationCorrespondentHandler)
router.post('/reset-db', resetDb)

router.get('/test-fbt-id', getTestFbtId)
router.get('/university-questions', getUniversityQuestions)

module.exports = router
