const { Router } = require('express')

const {
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  getFbtUserIds,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
} = require('../../services/feedbackTargets/interimFeedbacks')

const getInterimFeedbacks = async (req, res) => {
  const { user } = req
  const { fbtId } = req.params

  const iterimFeedbackTargets = await getInterimFeedbackTargets(fbtId, user)

  return res.send(iterimFeedbackTargets)
}

const createInterimFeedback = async (req, res) => {
  const { user } = req
  const { fbtId } = req.params

  const interimFeedbackTarget = await createInterimFeedbackTarget(fbtId, user, req.body)

  const studentIds = await getFbtUserIds(fbtId, 'STUDENT')
  const teacherIds = await getFbtUserIds(fbtId, 'RESPONSIBLE_TEACHER')

  const studentFeedbackTargets = await createUserFeedbackTargets(interimFeedbackTarget.id, studentIds, 'STUDENT')
  const teacherFeedbackTargets = await createUserFeedbackTargets(
    interimFeedbackTarget.id,
    teacherIds,
    'RESPONSIBLE_TEACHER'
  )

  const survey = await getInterimFeedbackById(interimFeedbackTarget.id)

  return res.status(201).send({
    ...survey.dataValues,
    userFeedbackTargets: [...studentFeedbackTargets, ...teacherFeedbackTargets],
  })
}

const router = Router()

router.get('/:fbtId/interimFeedbacks', getInterimFeedbacks)
router.post('/:fbtId/interimFeedbacks', createInterimFeedback)

module.exports = router
