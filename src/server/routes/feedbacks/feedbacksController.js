const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')
const { UserFeedbackTarget, FeedbackTarget, Feedback } = require('../../models')
const { validateFeedback } = require('../../util/feedbackValidator')
const { getFeedbackTargetContext, feedbackTargetCache } = require('../../services/feedbackTargets')
const { adminAccess } = require('../../middleware/adminAccess')

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
    throw new ApplicationError(
      'Attempt to create new feedback where one already exists. Use PUT to update the old',
      400
    )

  if (!(await validateFeedback(data, feedbackTarget))) throw new ApplicationError('Form data not valid', 400)

  const newFeedback = await Feedback.create({
    data,
    userId,
    degreeStudyRight,
  })

  await feedbackTarget.increment('feedbackCount', { by: 1 })

  userFeedbackTarget.feedbackId = newFeedback.id
  await userFeedbackTarget.save()

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

  feedback.data = req.body.data

  const updatedFeedback = await feedback.save()

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

  await feedbackTarget.decrement('feedbackCount', { by: 1 })
  await feedback.destroy()

  return res.sendStatus(200)
}

const updateAnswerHidden = async (req, res) => {
  const { user } = req
  const { id: feedbackId, questionId } = req.params
  const { hidden } = req.body
  if (typeof hidden !== 'boolean') {
    throw new ApplicationError('Invalid value for hidden', 400)
  }

  // find feedback
  const feedback = await Feedback.findByPk(feedbackId, {
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTarget',
      attributes: ['feedbackTargetId'],
    },
  })

  if (!feedback) ApplicationError.NotFound('Feedback not found')
  const { userFeedbackTarget } = feedback

  // check access
  const { feedbackTarget, access } = await getFeedbackTargetContext({
    feedbackTargetId: userFeedbackTarget.feedbackTargetId,
    user,
  })
  if (!access?.canHideFeedback()) ApplicationError.Forbidden('Must be responsible teacher, organisation admin or admin')

  // find and update question
  let updated = false
  feedback.data = feedback.data.map(answer => {
    if (answer.questionId === Number(questionId)) {
      updated = true
      return { ...answer, hidden }
    }
    return answer
  })

  if (!updated) {
    throw new ApplicationError('Question not found on feedback', 404)
  }

  await feedbackTarget.increment({ hiddenCount: hidden ? 1 : -1 })
  await feedback.save()

  return res.send({ hidden })
}

const adminDeleteAnswer = async (req, res) => {
  const { user } = req
  const { id: feedbackId, questionId } = req.params

  // find feedback
  const feedback = await Feedback.findByPk(feedbackId, {
    include: {
      model: UserFeedbackTarget,
      as: 'userFeedbackTarget',
      attributes: ['feedbackTargetId'],
    },
  })

  if (!feedback) ApplicationError.NotFound('Feedback not found')
  const { userFeedbackTarget } = feedback
  const { feedbackTargetId } = userFeedbackTarget

  // check access
  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })
  if (!access?.canAdminDeleteFeedback()) ApplicationError.Forbidden('Must be admin')

  // find and delete the answer
  let updated = false
  feedback.data = feedback.data.filter(answer => {
    if (answer.questionId === Number(questionId)) {
      updated = true
      return false
    }
    return true
  })

  if (!updated) {
    throw new ApplicationError('Question not found on feedback', 404)
  }

  await feedback.save()
  feedbackTargetCache.invalidate(feedbackTargetId)

  return res.sendStatus(200)
}

const adRouter = Router()

adRouter.post('/', create)
adRouter.get('/:id', getOne)
adRouter.put('/:id', update)
adRouter.delete('/:id', destroy)
adRouter.put('/:id/question/:questionId', updateAnswerHidden)
adRouter.delete('/:id/question/:questionId', adminAccess, adminDeleteAnswer)

const noadRouter = Router()

noadRouter.post('/', create)
noadRouter.put('/:id', update)
noadRouter.delete('/:id', destroy)

module.exports = {
  adRouter,
  noadRouter,
}
