const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')
const { UserFeedbackTarget, FeedbackTarget, Feedback } = require('../../models')
const { validateFeedback } = require('../../util/feedbackValidator')

const create = async (req, res) => {
  const { data, feedbackTargetId } = req.body
  const { id: userId, degreeStudyRigth } = req.user

  const feedbackTarget = await FeedbackTarget.findByPk(Number(feedbackTargetId))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackCanBeGiven = await feedbackTarget.feedbackCanBeGiven()

  if (!feedbackCanBeGiven)
    throw new ApplicationError('Feedback is not open', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId,
      feedbackTargetId: feedbackTarget.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  if (userFeedbackTarget.feedbackId)
    throw new ApplicationError(
      'Attempt to create new feedback where one already exists. Use PUT to update the old',
      400,
    )

  if (!(await validateFeedback(data, feedbackTarget)))
    throw new ApplicationError('Form data not valid', 400)

  const newFeedback = await Feedback.create({
    data,
    userId,
    degreeStudyRigth,
  })

  await feedbackTarget.increment('feedbackCount', { by: 1 })

  userFeedbackTarget.feedbackId = newFeedback.id
  await userFeedbackTarget.save()

  return res.send(newFeedback)
}

const getFeedbackForUser = async (req) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: req.user.id,
    },
  })

  if (!feedbackTarget) throw new ApplicationError('Forbidden', 403)

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

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await FeedbackTarget.findByPk(
    userFeedbackTarget.feedbackTargetId,
  )

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  if (!feedbackTarget.isOpen())
    throw new ApplicationError('Feedback is not open', 403)

  if (!(await validateFeedback(req.body.data, feedbackTarget)))
    throw new ApplicationError('Form data not valid', 400)

  feedback.data = req.body.data

  const updatedFeedback = await feedback.save()

  return res.send(updatedFeedback)
}

const destroy = async (req, res) => {
  const feedback = await getFeedbackForUser(req)

  await feedback.destroy()
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
