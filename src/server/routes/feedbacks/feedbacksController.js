const { Router } = require('express')
const Sentry = require('@sentry/node')
const { ApplicationError } = require('../../util/customErrors')
const { UserFeedbackTarget, FeedbackTarget, Feedback } = require('../../models')
const { validateFeedback } = require('../../util/feedbackValidator')
const { getFeedbackTargetContext } = require('../../services/feedbackTargets')
const {
  updateSummaryAfterFeedbackCreated,
  updateSummaryAfterFeedbackDestroyed,
} = require('../../services/summary/updateSummaryOnFeedback')
const { logger } = require('../../util/logger')

const create = async (req, res) => {
  const { user } = req
  const { data, feedbackTargetId } = req.body
  const { id: userId, degreeStudyRight } = req.user

  const { feedbackTarget, userFeedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  const feedbackCanBeGiven = await feedbackTarget.feedbackCanBeGiven()

  if (!feedbackCanBeGiven) ApplicationError.Forbidden('Feedback is not open')

  if (!access?.canGiveFeedback() || !userFeedbackTarget) ApplicationError.Forbidden('Not an enrolled student')

  if (userFeedbackTarget.feedbackId)
    throw new ApplicationError('Attempt to create new feedback where one already exists. Use PUT to update the old')

  if (!(await validateFeedback(data, feedbackTarget))) {
    throw new ApplicationError('Form data not valid', 400)
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

  return res.send(newFeedback)
}

const getFeedbackForUser = async req => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) ApplicationError.NotFound()

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
    },
  })

  if (!feedbackTarget) ApplicationError.Forbidden()

  return feedback
}

const getOne = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  return res.send(feedback)
}

const update = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) ApplicationError.NotFound()

  const feedbackTarget = await FeedbackTarget.findByPk(userFeedbackTarget.feedbackTargetId)

  if (!feedbackTarget) ApplicationError.NotFound()

  if (!feedbackTarget.isOpen()) throw new ApplicationError('Feedback is not open', 403)

  if (!(await validateFeedback(req.body.data, feedbackTarget))) throw new ApplicationError('Form data not valid', 400)

  // Updating userFeedbackTarget as well when the user gives feedback
  userFeedbackTarget.notGivingFeedback = false
  userFeedbackTarget.save()

  feedback.data = req.body.data
  const updatedFeedback = await feedback.save()

  // @TODO: Update summary

  return res.send(updatedFeedback)
}

const destroy = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await FeedbackTarget.findByPk(userFeedbackTarget.feedbackTargetId)

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  await feedback.destroy()

  // Update summary. Fail silently if fails
  try {
    await updateSummaryAfterFeedbackDestroyed(userFeedbackTarget.feedbackTargetId, feedback)
  } catch (err) {
    Sentry.captureException(err)
    logger.error('Failed to update summary after feedback destroyed', err)
  }

  return res.sendStatus(200)
}

const adRouter = Router()

adRouter.post('/', create)
adRouter.get('/:id', getOne)
adRouter.put('/:id', update)
adRouter.delete('/:id', destroy)

const noadRouter = Router()

noadRouter.post('/', create)
noadRouter.put('/:id', update)
noadRouter.delete('/:id', destroy)

module.exports = {
  adRouter,
  noadRouter,
}
