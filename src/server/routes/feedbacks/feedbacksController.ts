import { Response, Router } from 'express'
import Sentry from '@sentry/node'
import { ApplicationError } from '../../util/ApplicationError'
import { UserFeedbackTarget, FeedbackTarget, Feedback } from '../../models'
import { validateFeedback } from '../../util/feedbackValidator'
import { getFeedbackTargetContext } from '../../services/feedbackTargets'
import {
  updateSummaryAfterFeedbackCreated,
  updateSummaryAfterFeedbackDestroyed,
} from '../../services/summary/updateSummaryOnFeedback'
import { logger } from '../../util/logger'
import { AuthenticatedRequest } from '../../types'

const create = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { data, feedbackTargetId } = req.body
  const { id: userId, degreeStudyRight } = req.user

  const { feedbackTarget, userFeedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  const feedbackCanBeGiven = await feedbackTarget.feedbackCanBeGiven()

  if (!feedbackCanBeGiven) throw ApplicationError.Forbidden('Feedback is not open')

  if (!access?.canGiveFeedback() || !userFeedbackTarget) throw ApplicationError.Forbidden('Not an enrolled student')

  if (userFeedbackTarget.feedbackId)
    throw ApplicationError.BadRequest(
      'Attempt to create new feedback where one already exists. Use PUT to update the old'
    )

  if (!(await validateFeedback(data, feedbackTarget))) {
    throw ApplicationError.BadRequest('Form data not valid')
  }

  // Updating userFeedbackTarget as well when the user gives feedback
  userFeedbackTarget.notGivingFeedback = false

  const newFeedback = await Feedback.create({
    data,
    userId,
    degreeStudyRight,
  })

  userFeedbackTarget.feedbackId = newFeedback.id
  await userFeedbackTarget.save()

  // Update summary. Fail silently if fails
  try {
    await updateSummaryAfterFeedbackCreated(feedbackTargetId, newFeedback)
  } catch (err) {
    Sentry.captureException(err)
    logger.error('Failed to update summary after feedback created', err)
  }

  res.send(newFeedback)
}

const getFeedbackForUser = async (req: AuthenticatedRequest) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw ApplicationError.NotFound()

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
    },
  })

  if (!feedbackTarget) throw ApplicationError.Forbidden()

  return feedback
}

const getOne = async (req: AuthenticatedRequest, res: Response) => {
  const feedback = await getFeedbackForUser(req)

  res.send(feedback)
}

const update = async (req: AuthenticatedRequest, res: Response) => {
  const feedback = await getFeedbackForUser(req)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw ApplicationError.NotFound()

  const feedbackTarget = await FeedbackTarget.findByPk(userFeedbackTarget.feedbackTargetId)

  if (!feedbackTarget) throw ApplicationError.NotFound()

  if (!feedbackTarget.isOpen()) throw ApplicationError.Forbidden('Feedback is not open')

  if (!(await validateFeedback(req.body.data, feedbackTarget))) throw ApplicationError.BadRequest('Form data not valid')

  // Updating userFeedbackTarget as well when the user gives feedback
  userFeedbackTarget.notGivingFeedback = false
  userFeedbackTarget.save()

  feedback.data = req.body.data
  const updatedFeedback = await feedback.save()

  // @TODO: Update summary

  res.send(updatedFeedback)
}

const destroy = async (req: AuthenticatedRequest, res: Response) => {
  const feedback = await getFeedbackForUser(req)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw ApplicationError.NotFound()

  const feedbackTarget = await FeedbackTarget.findByPk(userFeedbackTarget.feedbackTargetId)

  if (!feedbackTarget) throw ApplicationError.NotFound()
  await feedback.destroy()

  // Update summary. Fail silently if fails
  try {
    await updateSummaryAfterFeedbackDestroyed(userFeedbackTarget.feedbackTargetId, feedback)
  } catch (err) {
    Sentry.captureException(err)
    logger.error('Failed to update summary after feedback destroyed', err)
  }

  res.sendStatus(200)
}

export const adRouter = Router()

adRouter.post('/', create)
adRouter.get('/:id', getOne)
adRouter.put('/:id', update)
adRouter.delete('/:id', destroy)

export const noadRouter = Router()

noadRouter.post('/', create)
noadRouter.put('/:id', update)
noadRouter.delete('/:id', destroy)
