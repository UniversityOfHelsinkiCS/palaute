import { Response, Router } from 'express'
import { AuthenticatedRequest } from 'types'
import { ApplicationError } from '../../util/customErrors'

import { createFeedbackTargetLog } from '../../services/auditLog'
import { mailer } from '../../mailer'
import interimFeedbackController from './interimFeedbackController'
import {
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
  getPublicFeedbackTargetsForOrganisation,
  notGivingFeedback,
  cacheFeedbackTargetById,
} from '../../services/feedbackTargets'
import { getWaitingFeedbackCountForStudent } from '../../services/feedbackTargets/getForStudent'
import { getFeedbackErrorViewDetails } from '../../services/feedbackTargets/getErrorViewDetails'
import { adminDeleteFeedback } from '../../services/feedbackTargets/hideFeedback'
import { PUBLIC_COURSE_BROWSER_ENABLED } from '../../util/config'

const adRouter = Router()
const noadRouter = Router()

adRouter.get('/for-organisation/:code', async (req: AuthenticatedRequest, res: Response) => {
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

  res.send(feedbackTargets)
})

if (PUBLIC_COURSE_BROWSER_ENABLED) {
  adRouter.get('/for-organisation/:codes/public', async (req: AuthenticatedRequest, res: Response) => {
    const { codes } = req.params
    const codeArray = codes.split(',')
    const { startDate, endDate } = req.query
    if (!codes || !codes.length) throw new ApplicationError('Missing code', 400)

    const feedbackTargets = await getPublicFeedbackTargetsForOrganisation({
      organisationCodes: codeArray,
      startDate,
      endDate,
    })

    res.send(feedbackTargets)
  })
}

adRouter.get('/for-student', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const feedbackTargets = await getFeedbackTargetsForStudent({ user })
  res.send(feedbackTargets)
})

adRouter.get('/for-student/waiting-count', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const waitingFeedbackCount = await getWaitingFeedbackCountForStudent({ user })
  res.send(waitingFeedbackCount)
})

adRouter.get('/for-course-realisation/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id: courseRealisationId } = req.params

  const feedbackTargets = await getFeedbackTargetsForCourseRealisation({
    courseRealisationId,
  })

  res.send(feedbackTargets)
})

adRouter.get('/for-course-unit/:code', async (req: AuthenticatedRequest, res: Response) => {
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

  res.send(feedbackTargets)
})

const getOne = async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const result = await getFeedbackTargetForUserById(feedbackTargetId, req.user)
  res.send(result)
}

adRouter.get('/:id', getOne)
noadRouter.get('/:id', getOne)

adRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    body: req.body,
  })

  res.send(updatedFeedbackTarget)
})

const getFeedbacks = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)
  const groupId = req.query.groupId as string // @TODO validate parse

  const feedbackData = await getFeedbacksForUserById(feedbackTargetId, user, groupId)

  res.send(feedbackData)
}

adRouter.get('/:id/feedbacks', getFeedbacks)
noadRouter.get('/:id/feedbacks', getFeedbacks)

adRouter.get('/:id/error-view-details', async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackTarget = await getFeedbackErrorViewDetails(feedbackTargetId)

  res.send(feedbackTarget)
})

adRouter.get('/:id/students-with-feedback', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)

  const students = await getStudentsForFeedbackTarget({
    feedbackTargetId,
    user,
  })

  res.send(students)
})

adRouter.put('/:id/response', async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargetId = Number(req.params.id)
  const { feedbackResponse, feedbackResponseEmailSent } = req.body.data
  const { user } = req

  const updatedFeedbackTarget = await updateFeedbackResponse({
    feedbackTargetId,
    responseText: feedbackResponse,
    sendEmail: feedbackResponseEmailSent,
    user,
  })

  const additionalData = await cacheFeedbackTargetById(feedbackTargetId)

  res.send({
    ...updatedFeedbackTarget,
    studentCount: additionalData.studentCount,
  })
})

adRouter.put('/:id/remind-students', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const feedbackTargetId = Number(req.params.id)
  const { reminder: reminderText, courseName } = req.body.data

  const feedbackTarget = await remindStudentsOnFeedback({
    feedbackTargetId,
    reminderText,
    courseName,
    user,
  })

  res.send({
    feedbackReminderLastSentAt: feedbackTarget.feedbackReminderLastSentAt,
  })
})

adRouter.put('/:id/open-immediately', async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargetId = Number(req.params.id)
  const { user, body } = req

  const updatedFeedbackTarget = await updateFeedbackTarget({
    feedbackTargetId,
    user,
    body: { feedbackOpeningReminderEmailSent: true, ...body },
  })

  if (!updatedFeedbackTarget.userCreated) await mailer.sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)

  await createFeedbackTargetLog(updatedFeedbackTarget, { openImmediately: true }, user)

  res.send(updatedFeedbackTarget)
})

adRouter.get('/:id/users', async (req: AuthenticatedRequest, res: Response) => {
  const feedbackTargetId = Number(req.params.id)

  const { user } = req

  const users = await getStudentTokensForFeedbackTarget({
    feedbackTargetId,
    user,
  })

  res.send(users)
})

adRouter.delete('/:id/user-feedback-targets/:userId', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { userId: teacherId } = req.params
  const feedbackTargetId = Number(req.params.id)

  await deleteTeacher({
    feedbackTargetId,
    teacherId,
    user,
  })

  res.sendStatus(200)
})

adRouter.get('/:id/logs', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params

  const logs = await getFeedbackTargetLogs({ feedbackTargetId, user })

  res.send(logs)
})

adRouter.put('/:id/hide-feedback', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const { questionId, feedbackContent, hidden } = req.body
  const count = await hideFeedback({ user, feedbackTargetId, questionId, feedbackContent, hidden })
  res.send({ hidden, count })
})

adRouter.put('/:id/delete-feedback', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const { questionId, feedbackContent } = req.body
  const count = await adminDeleteFeedback({ user, feedbackTargetId, questionId, feedbackContent })
  res.send({ count })
})

adRouter.put('/:id/not-giving-feedback', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params
  const result = await notGivingFeedback({ feedbackTargetId: Number(feedbackTargetId), user })
  res.send({ result })
})

adRouter.use('/', interimFeedbackController)

export { adRouter, noadRouter }
