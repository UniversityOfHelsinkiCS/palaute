const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')

const { createFeedbackTargetLog } = require('../../services/auditLog')
const { mailer } = require('../../mailer')
const interimFeedbackController = require('./interimFeedbackController')
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
  getFeedbackTargetsForOrganisation,
  hideFeedback,
} = require('../../services/feedbackTargets')
const { getFeedbackErrorViewDetails } = require('../../services/feedbackTargets/getErrorViewDetails')
const { adminDeleteFeedback } = require('../../services/feedbackTargets/hideFeedback')

const adRouter = Router()
const noadRouter = Router()

adRouter.get('/for-organisation/:code', async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { startDate, endDate } = req.query
  if (!code) throw new ApplicationError('Missing code', 400)

  const feedbackTargets = await getFeedbackTargetsForOrganisation({
    organisationCode: code,
    startDate,
    endDate,
    user,
  })

  return res.send(feedbackTargets)
})

adRouter.get('/for-student', async (req, res) => {
  const { user } = req
  const feedbackTargets = await getFeedbackTargetsForStudent({ user })
  return res.send(feedbackTargets)
})

adRouter.get('/for-course-realisation/:id', async (req, res) => {
  const { id: courseRealisationId } = req.params

  const feedbackTargets = await getFeedbackTargetsForCourseRealisation({
    courseRealisationId,
  })

  return res.send(feedbackTargets)
})

adRouter.get('/for-course-unit/:code', async (req, res) => {
  const courseCode = req.params.code
  const { user } = req

  const {
    courseRealisationStartDateAfter: startDateAfter,
    courseRealisationStartDateBefore: startDateBefore,
    courseRealisationEndDateAfter: endDateAfter,
    courseRealisationEndDateBefore: endDateBefore,
    feedbackType,
    includeSurveys,
    isOrganisationSurvey,
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
    isOrganisationSurvey,
  })

  return res.send(feedbackTargets)
})

const getOne = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const result = await getFeedbackTargetForUserById(feedbackTargetId, req.user, req.user.isAdmin)
  return res.send(result)
}

adRouter.get('/:id', getOne)
noadRouter.get('/:id', getOne)

adRouter.put('/:id', async (req, res) => {
  const { user } = req
  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    body: req.body,
  })

  return res.send(updatedFeedbackTarget)
})

const getFeedbacks = async (req, res) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)
  const { groupId } = req.query

  const feedbackData = await getFeedbacksForUserById(feedbackTargetId, user, groupId)

  return res.send(feedbackData)
}

adRouter.get('/:id/feedbacks', getFeedbacks)
noadRouter.get('/:id/feedbacks', getFeedbacks)

adRouter.get('/:id/error-view-details', async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackTarget = await getFeedbackErrorViewDetails(feedbackTargetId)

  return res.send(feedbackTarget)
})

adRouter.get('/:id/students-with-feedback', async (req, res) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)

  const students = await getStudentsForFeedbackTarget({
    feedbackTargetId,
    user,
  })

  return res.send(students)
})

adRouter.put('/:id/response', async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const { feedbackResponse, feedbackResponseEmailSent } = req.body.data
  const { user } = req

  const updatedFeedbackTarget = await updateFeedbackResponse({
    feedbackTargetId,
    responseText: feedbackResponse,
    sendEmail: feedbackResponseEmailSent,
    user,
  })

  return res.send(updatedFeedbackTarget)
})

adRouter.put('/:id/remind-students', async (req, res) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)
  const { reminder: reminderText, courseName } = req.body.data

  const feedbackTarget = await remindStudentsOnFeedback({
    feedbackTargetId,
    reminderText,
    courseName,
    user,
  })

  return res.send({
    feedbackReminderLastSentAt: feedbackTarget.feedbackReminderLastSentAt,
  })
})

adRouter.put('/:id/open-immediately', async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const { user, body } = req

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    body: { feedbackOpeningReminderEmailSent: true, ...body },
  })

  if (!updatedFeedbackTarget.userCreated) await mailer.sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)

  await createFeedbackTargetLog(updatedFeedbackTarget, { openImmediately: true }, user)

  return res.send(updatedFeedbackTarget)
})

adRouter.get('/:id/users', async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { user } = req

  const users = await getStudentTokensForFeedbackTarget({
    feedbackTargetId,
    user,
  })

  return res.send(users)
})

adRouter.delete('/:id/user-feedback-targets/:userId', async (req, res) => {
  const { user } = req
  const { userId: teacherId } = req.params
  const feedbackTargetId = Number(req.params.id)

  await deleteTeacher({
    feedbackTargetId,
    teacherId,
    user,
  })

  return res.sendStatus(200)
})

adRouter.get('/:id/logs', async (req, res) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params

  const logs = await getFeedbackTargetLogs({ feedbackTargetId, user })

  return res.send(logs)
})

adRouter.put('/:id/hide-feedback', async (req, res) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const { questionId, feedbackContent, hidden } = req.body
  const count = await hideFeedback({ user, feedbackTargetId, questionId, feedbackContent, hidden })
  res.send({ hidden, count })
})

adRouter.put('/:id/delete-feedback', async (req, res) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const { questionId, feedbackContent } = req.body
  const count = await adminDeleteFeedback({ user, feedbackTargetId, questionId, feedbackContent })
  res.send({ count })
})

adRouter.use('/', interimFeedbackController)

module.exports = {
  adRouter,
  noadRouter,
}
