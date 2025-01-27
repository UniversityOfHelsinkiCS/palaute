const { Router } = require('express')
const _ = require('lodash')

const {
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
  updateInterimFeedbackTarget,
  removeInterimFeedbackTarget,
  getInterimFeedbackParentFbt,
} = require('../../services/feedbackTargets/interimFeedbacks')
const { createSummaryForFeedbackTarget } = require('../../services/summary/createSummary')

const getInterimFeedbackParent = async (req, res) => {
  const { user } = req
  const { interimFbtId } = req.params

  const parentFeedbackTarget = await getInterimFeedbackParentFbt(interimFbtId, user)

  return res.send(parentFeedbackTarget)
}

const getInterimFeedbacks = async (req, res) => {
  const { user } = req
  const { fbtId } = req.params

  const interimFeedbackTargets = await getInterimFeedbackTargets(fbtId, user)

  return res.send(interimFeedbackTargets)
}

const createInterimFeedback = async (req, res) => {
  const { user } = req
  const { fbtId } = req.params

  let interimFeedbackTarget = await createInterimFeedbackTarget(fbtId, user, req.body)

  const userFeedbackTargets = await createUserFeedbackTargets(fbtId, interimFeedbackTarget.id)

  interimFeedbackTarget = await getInterimFeedbackById(interimFeedbackTarget.id)

  const summary = await createSummaryForFeedbackTarget(
    interimFeedbackTarget.id,
    _.countBy(userFeedbackTargets, 'accessStatus').STUDENT,
    interimFeedbackTarget.opensAt,
    interimFeedbackTarget.closesAt
  )

  return res.status(201).send({
    ...interimFeedbackTarget.dataValues,
    summary,
    userFeedbackTargets,
  })
}

const updateInterimFeedback = async (req, res) => {
  const { user } = req
  const { interimFbtId } = req.params

  const updatedInterimFeedbackTarget = await updateInterimFeedbackTarget(interimFbtId, user, req.body)

  return res.send(updatedInterimFeedbackTarget)
}

const removeInterimFeedback = async (req, res) => {
  const { user } = req
  const { interimFbtId } = req.params

  await removeInterimFeedbackTarget(interimFbtId, user)

  return res.status(204).send()
}

const router = Router()

router.get('/:fbtId/interimFeedbacks', getInterimFeedbacks)
router.get('/interimFeedbacks/:interimFbtId/parent', getInterimFeedbackParent)
router.post('/:fbtId/interimFeedbacks', createInterimFeedback)
router.put('/interimFeedbacks/:interimFbtId', updateInterimFeedback)
router.delete('/interimFeedbacks/:interimFbtId', removeInterimFeedback)

module.exports = router
