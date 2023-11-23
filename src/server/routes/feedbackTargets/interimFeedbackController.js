const { Router } = require('express')

const {
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  getFbtUserIds,
  getInterimFeedbackById,
} = require('../../services/feedbackTargets/interimFeedbacks')

const createInterimFeedback = async (req, res) => {
  const { user } = req
  const { fbtId } = req.params
  const { name, startDate, endDate } = req.body

  const interimFeedbackTarget = await createInterimFeedbackTarget(fbtId, { name, startDate, endDate })

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

router.post('/:fbtId/interimFeedback', createInterimFeedback)

module.exports = router
