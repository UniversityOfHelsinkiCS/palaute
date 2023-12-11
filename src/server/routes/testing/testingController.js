const { Op } = require('sequelize')
const Router = require('express')
const _ = require('lodash')
const { sequelize } = require('../../db/dbConnection')

const { testStudents, organisationCorrespondentUsers } = require('./utils/users')

const {
  FeedbackTarget,
  CourseUnit,
  CourseUnitsOrganisation,
  CourseRealisation,
  Organisation,
  User,
  UserFeedbackTarget,
  Survey,
  FeedbackTargetLog,
  CourseRealisationsOrganisation,
  CourseRealisationsTag,
  OrganisationFeedbackCorrespondent,
} = require('../../models')
const { run } = require('../../util/cron/refreshViewsCron')

const { ApplicationError } = require('../../util/customErrors')

const seedTestUsers = async users => {
  await User.bulkCreate(users, {
    ignoreDuplicates: true,
  })
}

const clearTestUsers = async users => {
  const userIds = users.map(user => user.id)

  await User.destroy({
    where: {
      id: { [Op.in]: userIds },
    },
  })
}

const seedTestOrganisationCorrespondents = async (organisationCode, users) => {
  const correspondentUserIds = users.map(user => user.id)

  const organisation = await Organisation.findOne({
    where: {
      code: organisationCode,
    },
  })

  await correspondentUserIds.forEach(async userId => {
    await OrganisationFeedbackCorrespondent.create({
      organisationId: organisation.id,
      userId,
    })
  })
}

const clearTestOrganisationCorrespondents = async organisationCode => {
  const organisation = await Organisation.findOne({
    where: {
      code: organisationCode,
    },
  })

  await OrganisationFeedbackCorrespondent.destroy({
    where: {
      organisationId: organisation.id,
    },
  })
}

const clearUserFbts = async users => {
  const userIds = users.map(user => user.id)

  await UserFeedbackTarget.destroy({
    where: {
      userId: { [Op.in]: userIds },
    },
  })
}

const clearOrganisatioSurveyFbts = async (req, res) => {
  const organisationSurveyFbts = await FeedbackTarget.findAll({
    where: {
      userCreated: true,
    },
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
            required: true,
            attributes: [],
          },
        ],
      },
    ],
  })

  const fbtIds = organisationSurveyFbts.map(fbt => fbt.id)
  const curIds = organisationSurveyFbts.map(fbt => fbt.courseRealisationId)

  const t = await sequelize.transaction()

  try {
    await UserFeedbackTarget.destroy({
      where: {
        feedbackTargetId: { [Op.in]: fbtIds },
      },
    })

    await Survey.destroy({
      where: {
        feedbackTargetId: { [Op.in]: fbtIds },
      },
    })

    await FeedbackTargetLog.destroy({
      where: {
        feedbackTargetId: { [Op.in]: fbtIds },
      },
    })

    await FeedbackTarget.destroy({
      where: {
        id: { [Op.in]: fbtIds },
      },
    })

    await CourseRealisationsOrganisation.destroy({
      where: {
        courseRealisationId: { [Op.in]: curIds },
      },
    })

    await CourseRealisationsTag.destroy({
      where: {
        courseRealisationId: { [Op.in]: curIds },
      },
    })

    await CourseRealisation.destroy({
      where: {
        id: { [Op.in]: curIds },
      },
    })

    await t.commit()
  } catch (err) {
    await t.rollback()
    throw err
  }

  return res.send(204)
}

const createTestStudents = async (req, res) => {
  await seedTestUsers(testStudents)

  return res.send(201)
}

const clearTestStudents = async (req, res) => {
  await clearUserFbts(testStudents)
  await clearTestUsers(testStudents)

  return res.send(204)
}

const createTestCorrespondents = async (req, res) => {
  const { organisationCode } = req.params
  await seedTestUsers(organisationCorrespondentUsers)

  await seedTestOrganisationCorrespondents(organisationCode, organisationCorrespondentUsers)

  return res.send(201)
}

const clearTestCorrespondents = async (req, res) => {
  const { organisationCode } = req.params

  await clearTestOrganisationCorrespondents(organisationCode)
  await clearTestUsers(organisationCorrespondentUsers)

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
router.post('/clear/user/correspondent/:organisationCode', clearTestCorrespondents)
router.post('/clear/organisation-surveys', clearOrganisatioSurveyFbts)

router.post('/seed/user/student', createTestStudents)
router.post('/seed/user/correspondent/:organisationCode', createTestCorrespondents)

router.put('/user/:userId', updateUser)

router.put('/courseRealisation/:feedbackTargetId', updateCourseRealisation)
router.put('/courseRealisations', updateManyCourseRealisations)

router.put('/enableCourses', enableAllCourses)
router.put('/refresh-summary', refreshSummary)

module.exports = router
