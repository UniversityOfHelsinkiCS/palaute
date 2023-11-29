const { Router } = require('express')

const {
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  getFbtUserIds,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
  updateInterimFeedbackTarget,
  removeInterimFeedbackTarget,
  getFbtAdministrativePersons,
  getInterimFeedbackParentFbt,
} = require('../../services/feedbackTargets/interimFeedbacks')

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

  const interimFeedbackTarget = await createInterimFeedbackTarget(fbtId, user, req.body)

  const studentIds = await getFbtUserIds(fbtId, 'STUDENT')
  const teacherIds = await getFbtUserIds(fbtId, 'RESPONSIBLE_TEACHER')
  const administrativePersons = await getFbtAdministrativePersons(fbtId)

  const studentFeedbackTargets = await createUserFeedbackTargets(interimFeedbackTarget.id, studentIds, 'STUDENT')
  const teacherFeedbackTargets = await createUserFeedbackTargets(
    interimFeedbackTarget.id,
    teacherIds,
    'RESPONSIBLE_TEACHER',
    administrativePersons
  )

  const interimFeedback = await getInterimFeedbackById(interimFeedbackTarget.id)

  return res.status(201).send({
    ...interimFeedback.dataValues,
    userFeedbackTargets: [...studentFeedbackTargets, ...teacherFeedbackTargets],
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
