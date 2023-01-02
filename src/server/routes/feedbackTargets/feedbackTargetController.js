const _ = require('lodash')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const { addMonths, getYear, subDays, getDate, compareAsc } = require('date-fns')

const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
  User,
  Organisation,
  Tag,
} = require('../../models')

const { createFeedbackTargetLog } = require('../../util/auditLog')
const { mailer } = require('../../mailer')
const { JWT_KEY } = require('../../util/config')
const updateEnrolmentNotification = require('./updateEnrolmentNotification')
const { getEnrolmentNotification } = require('../../services/enrolmentNotices/enrolmentNotices')
const {
  getFeedbackTargetForUserById,
  getFeedbacksForUserById,
  updateFeedbackResponse,
  updateFeedbackTarget,
  getStudentsForFeedbackTarget,
  getFeedbackTargetsForStudent,
  getFeedbackTargetsForCourseRealisation,
  getFeedbackTargetLogs,
  deleteTeacher,
} = require('../../services/feedbackTargets')

const getFeedbackTargetsForOrganisation = async (req, res) => {
  const { code } = req.params
  const { startDate, endDate } = req.query
  if (!code) throw new ApplicationError('Missing code', 400)
  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : addMonths(start, 12)

  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: ['id', 'name', 'feedbackCount', 'opensAt', 'closesAt', 'feedbackResponseEmailSent'],
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: ['id', 'name', 'startDate', 'endDate', 'isMoocCourse', 'teachingLanguages'],
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            attributes: [],
            required: true,
            where: {
              code,
            },
          },
          {
            model: Tag,
            as: 'tags',
          },
        ],
        where: {
          startDate: {
            [Op.gte]: start,
          },
          endDate: {
            [Op.lte]: end,
          },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        attributes: ['accessStatus'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      },
    ],
  })

  const feedbackTargetsWithUniqueCurs = _.uniqBy(feedbackTargets, fbt => fbt.dataValues.courseRealisation.id)

  const feedbackTargetsWithStudentCounts = feedbackTargetsWithUniqueCurs
    .map(fbt => fbt.toJSON())
    .map(fbt => {
      const studentCount = _.sumBy(fbt.userFeedbackTargets, ufbt => (ufbt.accessStatus === 'STUDENT' ? 1 : 0))
      const teachers = fbt.userFeedbackTargets
        .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' || ufbt.accessStatus === 'TEACHER')
        .map(ufbt => ufbt.user)

      delete fbt.userFeedbackTargets
      return {
        ...fbt,
        startDate: fbt.courseRealisation.startDate,
        studentCount,
        teachers,
      }
    })

  const dateGrouped = Object.entries(_.groupBy(feedbackTargetsWithStudentCounts, fbt => fbt.startDate)).sort(
    ([a], [b]) => compareAsc(Date.parse(a), Date.parse(b))
  )

  const monthGrouped = Object.entries(
    _.groupBy(dateGrouped, ([date]) => {
      const d = Date.parse(date)
      return subDays(d, getDate(d) - 1) // first day of month
    })
  ).sort(([a], [b]) => compareAsc(Date.parse(a), Date.parse(b)))

  const yearGrouped = Object.entries(_.groupBy(monthGrouped, ([date]) => getYear(Date.parse(date)))).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return res.send(yearGrouped)
}

const getOne = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  try {
    const result = await getFeedbackTargetForUserById(feedbackTargetId, req.user, req.isAdmin)
    return res.send(result)
  } catch (error) {
    if (error.status === 403) {
      const enabled = await getEnrolmentNotification(req.user.id, feedbackTargetId)
      return res.status(403).send({ enabled })
    }
    throw error
  }
}

const update = async (req, res) => {
  const { isAdmin, user } = req
  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    isAdmin,
    body: req.body,
  })

  return res.send(updatedFeedbackTarget)
}

const getForStudent = async (req, res) => {
  const { user } = req
  const feedbackTargets = await getFeedbackTargetsForStudent({ user })
  return res.send(feedbackTargets)
}

const getTargetsForCourseUnit = async (req, res) => {
  const courseCode = req.params.code
  const { user } = req

  const {
    courseRealisationStartDateAfter,
    courseRealisationStartDateBefore,
    courseRealisationEndDateAfter,
    courseRealisationEndDateBefore,
    feedbackType,
    includeSurveys,
  } = req.query

  const courseRealisationWhere = {
    [Op.and]: [
      courseRealisationStartDateAfter && {
        startDate: {
          [Op.gt]: new Date(courseRealisationStartDateAfter),
        },
      },
      courseRealisationStartDateBefore && {
        startDate: {
          [Op.lt]: new Date(courseRealisationStartDateBefore),
        },
      },
      courseRealisationEndDateAfter && {
        endDate: {
          [Op.gt]: new Date(courseRealisationEndDateAfter),
        },
      },
      courseRealisationEndDateBefore && {
        endDate: {
          [Op.lt]: new Date(courseRealisationEndDateBefore),
        },
      },
    ].filter(Boolean),
  }

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      [Op.and]: [
        feedbackType && {
          feedbackType,
        },
      ].filter(Boolean),
    },
    order: [[{ model: CourseRealisation, as: 'courseRealisation' }, 'startDate', 'DESC']],
    include: [
      {
        model: UserFeedbackTarget.scope('teachers'),
        as: 'userFeedbackTargets',
        required: true,
        where: {
          userId: user.id,
        },
      },
      {
        model: UserFeedbackTarget.scope('students'),
        as: 'students',
        required: false,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        where: {
          courseCode,
        },
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: courseRealisationWhere,
      },
    ],
  })

  if (feedbackTargets.length === 0) {
    return res.send([])
  }

  if (includeSurveys === 'true') {
    for (const target of feedbackTargets) {
      const surveys = await target.getSurveys()
      target.populateSurveys(surveys)
    }
  }

  const formattedFeedbackTargets = feedbackTargets
    .map(target => ({
      ..._.pick(target.toJSON(), [
        'id',
        'name',
        'opensAt',
        'closesAt',
        'feedbackType',
        'courseRealisation',
        'courseUnit',
        'feedbackResponse',
        'continuousFeedbackEnabled',
        'questions',
        'surveys',
        'feedbackCount',
      ]),
      studentCount: target.students.length,
      feedbackResponseGiven: target.feedbackResponse?.length > 3,
      feedbackResponseSent: target.feedbackResponseEmailSent,
    }))
    .filter(fbt => fbt.feedbackCount > 0 || Date.parse(fbt.courseRealisation.endDate) > new Date('2021-09-01'))

  return res.send(formattedFeedbackTargets)
}

const getFeedbacks = async (req, res) => {
  const { user, isAdmin } = req
  const feedbackTargetId = Number(req.params.id)

  const feedbackData = await getFeedbacksForUserById(feedbackTargetId, user, isAdmin)

  return res.send(feedbackData)
}

const getStudentsWithFeedback = async (req, res) => {
  const { user, isAdmin } = req
  const feedbackTargetId = Number(req.params.id)

  const students = await getStudentsForFeedbackTarget({
    feedbackTargetId,
    user,
    isAdmin,
  })

  return res.send(students)
}

const putFeedbackResponse = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const { feedbackResponse, feedbackResponseEmailSent } = req.body.data
  const { user, isAdmin } = req

  const updatedFeedbackTarget = await updateFeedbackResponse({
    feedbackTargetId,
    isAdmin, // TODO get rid of isAdmins, instead include it in the user object
    responseText: feedbackResponse,
    sendEmail: feedbackResponseEmailSent,
    user,
  })

  return res.send(updatedFeedbackTarget)
}

const remindStudentsOnFeedback = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  let relevantFeedbackTarget
  if (req.isAdmin) {
    relevantFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)
  } else {
    const feedbackTargetsUserIsTeacherTo = await req.user.feedbackTargetsHasTeacherAccessTo()

    relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(target => target.id === feedbackTargetId)
  }

  if (!relevantFeedbackTarget)
    throw new ApplicationError(`No feedback target found with id ${feedbackTargetId} for user`, 404)

  const { data: reminder } = req.body.data

  await mailer.sendFeedbackReminderToStudents(relevantFeedbackTarget, reminder)

  return res.send({
    feedbackReminderLastSentAt: relevantFeedbackTarget.feedbackReminderLastSentAt,
  })
}

const openFeedbackImmediately = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const { user, isAdmin, body } = req

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    isAdmin,
    body: { feedbackOpeningReminderEmailSent: true, ...body },
  })

  if (!updatedFeedbackTarget.feedbackOpeningReminderEmailSent) {
    await mailer.sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)
  }

  await createFeedbackTargetLog(updatedFeedbackTarget, { openImmediately: true }, user)

  return res.sendStatus(200)
}

const getUsers = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { isAdmin } = req

  if (!isAdmin) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
    },
    include: [
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
  })

  const users = userFeedbackTargets.map(({ user }) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    studentNumber: user.studentNumber,
    token: jwt.sign({ username: user.username }, JWT_KEY),
  }))

  return res.send(users)
}

const deleteUserFeedbackTarget = async (req, res) => {
  const { user, isAdmin } = req
  const { userId: teacherId } = req.params
  const feedbackTargetId = Number(req.params.id)

  await deleteTeacher({
    feedbackTargetId,
    teacherId,
    user,
    isAdmin,
  })

  return res.sendStatus(200)
}

const getLogs = async (req, res) => {
  const { user, isAdmin } = req
  const { id: feedbackTargetId } = req.params

  const logs = await getFeedbackTargetLogs({ feedbackTargetId, user, isAdmin })

  return res.send(logs)
}

const getForCourseRealisation = async (req, res) => {
  const { id: courseRealisationId } = req.params

  const feedbackTargets = await getFeedbackTargetsForCourseRealisation({
    courseRealisationId,
  })

  return res.send(feedbackTargets)
}

const adRouter = Router()

// @TODO Maybe refactor these 4 routes to use query params, eg. GET /targets?course-unit=TKT1001
adRouter.get('/for-student', getForStudent)
adRouter.get('/for-course-unit/:code', getTargetsForCourseUnit)
adRouter.get('/for-course-realisation/:id', getForCourseRealisation)
adRouter.get('/for-organisation/:code', getFeedbackTargetsForOrganisation)

adRouter.get('/:id', getOne)
adRouter.put('/:id', update)
adRouter.get('/:id/feedbacks', getFeedbacks)
adRouter.get('/:id/users', getUsers)
adRouter.get('/:id/logs', getLogs)
adRouter.put('/:id/response', putFeedbackResponse)
adRouter.put('/:id/remind-students', remindStudentsOnFeedback)
adRouter.get('/:id/students-with-feedback', getStudentsWithFeedback)
adRouter.put('/:id/open-immediately', openFeedbackImmediately)
adRouter.delete('/:id/user-feedback-targets/:userId', deleteUserFeedbackTarget)
adRouter.put('/:id/enrolment-notification', updateEnrolmentNotification)

const noadRouter = Router()

noadRouter.get('/:id', getOne)
noadRouter.get('/:id/feedbacks', getFeedbacks)
noadRouter.put('/:id/enrolment-notification', updateEnrolmentNotification)

module.exports = {
  adRouter,
  noadRouter,
}
