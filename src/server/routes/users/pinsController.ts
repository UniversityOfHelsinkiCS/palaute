import { Response, Router } from 'express'

import { Organisation, UserOrganisationPin } from '../../models'
import { AuthenticatedRequest } from '../../types'
import { ApplicationError } from '../../util/ApplicationError'

const router = Router()

router.get('/users/me/pinned-organisations', async (req: AuthenticatedRequest, res: Response) => {
  const pins = await UserOrganisationPin.findAll({ where: { userId: req.user.id } })
  const organisationIds = pins.map(p => p.organisationId)

  if (organisationIds.length === 0) {
    res.send([])
    return
  }

  const organisations = await Organisation.findAll({
    where: { id: organisationIds },
    attributes: ['id', 'code', 'name'],
  })

  res.send(organisations)
})

router.post('/users/me/pinned-organisations', async (req: AuthenticatedRequest, res: Response) => {
  const { organisationId } = req.body

  if (!organisationId || typeof organisationId !== 'string') {
    throw ApplicationError.BadRequest('organisationId is required')
  }

  const organisation = await Organisation.findByPk(organisationId)
  if (!organisation) {
    throw ApplicationError.NotFound('Organisation not found')
  }

  await UserOrganisationPin.findOrCreate({
    where: { userId: req.user.id, organisationId },
  })

  res.sendStatus(204)
})

router.delete('/users/me/pinned-organisations/:organisationId', async (req: AuthenticatedRequest, res: Response) => {
  const { organisationId } = req.params

  await UserOrganisationPin.destroy({
    where: { userId: req.user.id, organisationId },
  })

  res.sendStatus(204)
})

export { router }
