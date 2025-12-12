import { Response, Router } from 'express'
import { User, OrganisationFeedbackCorrespondent } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { getAccessAndOrganisation } from './util'
import { createOrganisationLog } from '../../services/auditLog'
import { ENABLE_CORRESPONDENT_MANAGEMENT } from '../../util/config'
import { AuthenticatedRequest } from '../../types'

const addOrganisationFeedbackCorrespondent = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params
  const { userId } = req.body

  const { organisation } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  const userToAdd = await User.findByPk(userId)
  if (!userToAdd) {
    throw ApplicationError.BadRequest('User not found')
  }
  if (await userToAdd.hasOrganisation(organisation)) {
    throw ApplicationError.BadRequest('User already is feedback correspondent of that organisation')
  }

  await OrganisationFeedbackCorrespondent.create({
    organisationId: organisation.id,
    userId,
    userCreated: true,
  })

  const logUpdates = {
    newFeedbackCorrespondent: userId,
  }

  await createOrganisationLog(organisation, logUpdates, user)

  const users = await organisation.getUsers()

  res.send(users)
}

const removeOrganisationFeedbackCorrespondent = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code, userId } = req.params

  const { organisation } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  const userToRemove = await User.findByPk(userId)
  if (!userToRemove) {
    throw ApplicationError.BadRequest(`User ${userId} not found`)
  }
  if (!(await userToRemove.hasOrganisation(organisation))) {
    throw ApplicationError.BadRequest('User is not feedback correspondent of that organisation')
  }

  await OrganisationFeedbackCorrespondent.destroy({
    where: {
      organisationId: organisation.id,
      userId,
    },
  })

  const logUpdates = {
    removedFeedbackCorrespondent: userId,
  }

  await createOrganisationLog(organisation, logUpdates, user)

  const users = await organisation.getUsers()

  res.send(users)
}

export const router = Router()

if (ENABLE_CORRESPONDENT_MANAGEMENT) {
  router.post('/:code/feedback-correspondents', addOrganisationFeedbackCorrespondent)
  router.delete('/:code/feedback-correspondents/:userId', removeOrganisationFeedbackCorrespondent)
}
