import { Response, Router } from 'express'
import { ContinuousFeedback, UserFeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { sendEmailContinuousFeedbackResponseToStudent } from '../../mailer/mails'
import { getFeedbackTargetContext } from '../../services/feedbackTargets'
import { adminAccess } from '../../middleware/adminAccess'
import { AuthenticatedRequest } from '../../types'
import { Access } from '../../services/feedbackTargets/Access'

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
router.post('/:id/response/:continuousFeedbackId', respondToFeedback)
router.delete('/:id/:continuousFeedbackId', adminAccess, deleteFeedback)

export default router
