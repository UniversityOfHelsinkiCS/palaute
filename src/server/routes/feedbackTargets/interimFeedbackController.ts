import { Response, Router } from 'express'
import _ from 'lodash'

import {
  createUserFeedbackTargets,
  createInterimFeedbackTarget,
  getInterimFeedbackById,
  getInterimFeedbackTargets,
  updateInterimFeedbackTarget,
  removeInterimFeedbackTarget,
  getInterimFeedbackParentFbt,
} from '../../services/feedbackTargets/interimFeedbacks'
import { createSummaryForFeedbackTarget } from '../../services/summary/createSummary'
import { AuthenticatedRequest } from '../../types'

export const router = Router()

router.get('/:fbtId/interimFeedbacks', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { interimFbtId } = req.params

  const parentFeedbackTarget = await getInterimFeedbackParentFbt(interimFbtId, user)

  res.send(parentFeedbackTarget)
})

router.get('/interimFeedbacks/:interimFbtId/parent', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { fbtId } = req.params

  const interimFeedbackTargets = await getInterimFeedbackTargets(fbtId, user)

  res.send(interimFeedbackTargets)
})

router.post('/:fbtId/interimFeedbacks', async (req: AuthenticatedRequest, res: Response) => {
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

  res.status(201).send({
    ...interimFeedbackTarget.dataValues,
    summary,
    userFeedbackTargets,
  })
})

router.put('/interimFeedbacks/:interimFbtId', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { interimFbtId } = req.params

  const updatedInterimFeedbackTarget = await updateInterimFeedbackTarget(interimFbtId, user, req.body)

  res.send(updatedInterimFeedbackTarget)
})

router.delete('/interimFeedbacks/:interimFbtId', async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { interimFbtId } = req.params

  await removeInterimFeedbackTarget(interimFbtId, user)

  res.status(204).send()
})
