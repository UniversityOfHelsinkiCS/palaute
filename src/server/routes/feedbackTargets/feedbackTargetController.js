const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')

const { createFeedbackTargetLog } = require('../../util/auditLog')
const { mailer } = require('../../mailer')
const {
  getEnrolmentNotification,
  requestEnrolmentNotification,
} = require('../../services/enrolmentNotices/enrolmentNotices')
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
} = require('../../services/feedbackTargets')

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
})

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

  const feedbackData = await getFeedbacksForUserById(feedbackTargetId, user)

  return res.send(feedbackData)
}
adRouter.get('/:id/feedbacks', getFeedbacks)
noadRouter.get('/:id/feedbacks', getFeedbacks)

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
  const { data: reminderText } = req.body.data

  const feedbackTarget = await remindStudentsOnFeedback({
    feedbackTargetId,
    reminderText,
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

  if (!updatedFeedbackTarget.feedbackOpeningReminderEmailSent) {
    await mailer.sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)
  }

  await createFeedbackTargetLog(updatedFeedbackTarget, { openImmediately: true }, user)

  return res.sendStatus(200)
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

const updateEnrolmentNotification = async (req, res) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const { enabled: enabledRaw } = req.body
  const enabled = Boolean(enabledRaw)

  // Could check if enrolment already exists, but it doesnt really matter... the notification will just expire anyways.
  await requestEnrolmentNotification(user.id, feedbackTargetId, enabled)

  return res.send({ enabled, email: user.getDefaultEmail() })
}
adRouter.put('/:id/enrolment-notification', updateEnrolmentNotification)
noadRouter.put('/:id/enrolment-notification', updateEnrolmentNotification)

module.exports = {
  adRouter,
  noadRouter,
}
