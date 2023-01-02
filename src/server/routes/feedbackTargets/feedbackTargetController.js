const _ = require('lodash')
const { Op } = require('sequelize')
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
  getStudentTokensForFeedbackTarget,
  remindStudentsOnFeedback,
  getFeedbackTargetsForCourseUnit,
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
    courseRealisationStartDateAfter: startDateAfter,
    courseRealisationStartDateBefore: startDateBefore,
    courseRealisationEndDateAfter: endDateAfter,
    courseRealisationEndDateBefore: endDateBefore,
    feedbackType,
    includeSurveys,
  } = req.query

  const feedbackTargets = await getFeedbackTargetsForCourseUnit({
    user,
    courseCode,
    startDateAfter,
    startDateBefore,
    endDateAfter,
    endDateBefore,
    feedbackType,
    includeSurveys,
  })

  return res.send(feedbackTargets)
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

const sendReminderOnFeedback = async (req, res) => {
  const { user, isAdmin } = req
  const feedbackTargetId = Number(req.params.id)
  const { data: reminderText } = req.body.data

  const feedbackTarget = await remindStudentsOnFeedback({
    feedbackTargetId,
    reminderText,
    user,
    isAdmin,
  })

  return res.send({
    feedbackReminderLastSentAt: feedbackTarget.feedbackReminderLastSentAt,
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

const getStudentTokens = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { user, isAdmin } = req

  const users = await getStudentTokensForFeedbackTarget({
    feedbackTargetId,
    user,
    isAdmin,
  })

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
adRouter.get('/:id/users', getStudentTokens)
adRouter.get('/:id/logs', getLogs)
adRouter.put('/:id/response', putFeedbackResponse)
adRouter.put('/:id/remind-students', sendReminderOnFeedback)
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
