const { Op } = require('sequelize')
const Router = require('express')

const _ = require('lodash')
const { testStudents } = require('./utils/users')

const { FeedbackTarget, CourseRealisation, Organisation, User } = require('../../models')
const { run } = require('../../util/cron/refreshViewsCron')

const { ApplicationError } = require('../../util/customErrors')

const seedTestUsers = async users => {
  await User.bulkCreate(users)
}

const clearTestUsers = async users => {
  const userIds = users.map(user => user.id)

  await User.destroy({
    where: {
      id: { [Op.in]: userIds },
    },
  })
}

const createTestStudents = async (req, res) => {
  await seedTestUsers(testStudents)

  return res.send(201)
}

const clearTestStudents = async (req, res) => {
  await clearTestUsers(testStudents)

  return res.send(204)
}

const updateCourseRealisation = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('No user found', 404)

  const { feedbackTargetId } = req.params

  const feedbackTarget = await FeedbackTarget.findByPk(Number(feedbackTargetId))

  if (!feedbackTarget) throw new ApplicationError('Feedback target not found', 404)

  const courseRealisation = await CourseRealisation.findByPk(feedbackTarget.courseRealisationId)

  if (!courseRealisation) throw new ApplicationError('Course realisation not found', 404)

  const updates = _.pick(req.body, ['startDate', 'endDate'])

  Object.assign(courseRealisation, updates)

  await courseRealisation.save()

  const { feedbackResponse, feedbackResponseEmailSent } = req.body

  let feedbackCount = Number(req.body?.feedbackCount)
  feedbackCount = Number.isNaN(feedbackCount) ? feedbackTarget.feedbackCount : feedbackCount

  Object.assign(feedbackTarget, {
    feedbackCount,
    opensAt: updates.startDate,
    closesAt: updates.endDate,
    feedbackResponse,
    feedbackResponseEmailSent,
  })

  await feedbackTarget.save()

  return res.sendStatus(200)
}

const updateManyCourseRealisations = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('No user found', 404)

  const { feedbackTargetIds } = _.pick(req.body, ['feedbackTargetIds'])

  const updates = _.pick(req.body, ['startDate', 'endDate'])

  /* eslint-disable */
  for (const id of feedbackTargetIds) {
    const feedbackTarget = await FeedbackTarget.findByPk(Number(id))

    if (!feedbackTarget) throw new ApplicationError('Feedback target not found', 404)

    const courseRealisation = await CourseRealisation.findByPk(feedbackTarget.courseRealisationId)

    if (!courseRealisation) throw new ApplicationError('Course realisation not found', 404)

    Object.assign(courseRealisation, updates)

    await courseRealisation.save()
  }
  /* eslint-enable */

  return res.send(200)
}

const enableAllCourses = async (_, res) => {
  await Organisation.update(
    {
      disabledCourseCodes: [],
    },
    { where: {} }
  )
  return res.send(200)
}

const updateUser = async (req, res) => {
  const { userId } = req.params

  const user = await User.findByPk(userId)

  if (!user) throw new ApplicationError('User not found', 404)

  const updates = _.pick(req.body, ['employeeNumber', 'studentNumber', 'username'])

  Object.assign(user, updates)

  await user.save()

  return res.send(200)
}

const refreshSummary = async (req, res) => {
  await run()
  return res.send(200)
}

const router = Router()

router.post('/clear/user/student', clearTestStudents)

router.post('/seed/user/student', createTestStudents)

router.put('/user/:userId', updateUser)

router.put('/courseRealisation/:feedbackTargetId', updateCourseRealisation)
router.put('/courseRealisations', updateManyCourseRealisations)

router.put('/enableCourses', enableAllCourses)
router.put('/refresh-summary', refreshSummary)

module.exports = router
