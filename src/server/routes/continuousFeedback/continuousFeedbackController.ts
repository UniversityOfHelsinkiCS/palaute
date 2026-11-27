import { Response, Router } from 'express'

import { sendEmailContinuousFeedbackResponseToStudent } from '../../mailer/mails'
import { adminAccess } from '../../middleware/adminAccess'
import { ContinuousFeedback, UserFeedbackTarget } from '../../models'
import { getFeedbackTargetContext } from '../../services/feedbackTargets'
import { Access } from '../../services/feedbackTargets/Access'
import { AuthenticatedRequest } from '../../types'
import { ApplicationError } from '../../util/ApplicationError'

const getStudentContinuousFeedbacks = async (user: any, feedbackTargetId: number) => {
  const userFeedbackTarget = await UserFeedbackTarget.scope('students').findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
  })

  if (!userFeedbackTarget) throw ApplicationError.Forbidden()

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
      userId: user.id,
    },
  })

  return continuousFeedbacks
}

const getFeedbacks = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)

  const { access }: { access: Access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSeeContinuousFeedbacks()) {
    const continuousFeedbacks = await getStudentContinuousFeedbacks(user, feedbackTargetId)

    res.send(continuousFeedbacks)
    return
  }

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
    },
  })

  res.send(continuousFeedbacks)
}

const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const { feedback } = req.body

  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canGiveContinuousFeedback())
    throw ApplicationError.Forbidden('User not allowed to give continuous feedback')

  const { continuousFeedbackEnabled, sendContinuousFeedbackDigestEmail: sendInDigestEmail } = feedbackTarget

  if (!continuousFeedbackEnabled) throw ApplicationError.Forbidden('Continuous feedback is disabled')

  const continuousFeedbackIsOver = (await feedbackTarget.feedbackCanBeGiven()) || feedbackTarget.isEnded()

  if (continuousFeedbackIsOver) throw ApplicationError.Forbidden('Continuous feedback is closed')

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId: user.id,
    sendInDigestEmail,
  })

  res.send(newFeedback)
}

const editFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)
  const { feedback } = req.body

  if (typeof feedback !== 'string' || !feedback.trim()) throw ApplicationError.BadRequest('Feedback missing')

  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canGiveContinuousFeedback())
    throw ApplicationError.Forbidden('User not allowed to give continuous feedback')

  if (!feedbackTarget.continuousFeedbackEnabled) throw ApplicationError.Forbidden('Continuous feedback is disabled')

  const continuousFeedbackIsOver = (await feedbackTarget.feedbackCanBeGiven()) || feedbackTarget.isEnded()

  if (continuousFeedbackIsOver) throw ApplicationError.Forbidden('Continuous feedback is closed')

  const continuousFeedback = await ContinuousFeedback.findOne({
    where: {
      id: continuousFeedbackId,
      feedbackTargetId,
      userId: user.id,
    },
  })

  if (!continuousFeedback) throw ApplicationError.NotFound('Continuous feedback not found')

  // The teacher's response was written to the original text, so editing it afterwards would break the conversation
  if (continuousFeedback.response) throw ApplicationError.Forbidden('Continuous feedback has already been responded to')

  continuousFeedback.data = feedback
  await continuousFeedback.save()

  res.send(continuousFeedback)
}

const respondToFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)
  const { response } = req.body

  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canRespondToContinuousFeedback()) throw ApplicationError.Forbidden()

  const continuousFeedback = await ContinuousFeedback.findByPk(continuousFeedbackId)

  if (!response && !continuousFeedback.responseEmailSent) {
    throw ApplicationError.BadRequest('Response missing')
  }

  continuousFeedback.response = response
  await continuousFeedback.save()

  const { id, responseEmailSent } = continuousFeedback
  if (!responseEmailSent) {
    sendEmailContinuousFeedbackResponseToStudent(id)
  }

  res.send(continuousFeedback)
}

const deleteFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  const feedbackTargetId = Number(req.params.id)
  const continuousFeedbackId = Number(req.params.continuousFeedbackId)

  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canAdminDeleteFeedback()) throw ApplicationError.Forbidden()

  const continuousFeedback = await ContinuousFeedback.findByPk(continuousFeedbackId)

  await continuousFeedback.destroy()

  res.send(continuousFeedback)
}

const router = Router()

router.get('/:id', getFeedbacks)
router.post('/:id', submitFeedback)
router.put('/:id/:continuousFeedbackId', editFeedback)
router.post('/:id/response/:continuousFeedbackId', respondToFeedback)
router.delete('/:id/:continuousFeedbackId', adminAccess, deleteFeedback)

export default router
