const { Router } = require('express')
const { User, OrganisationFeedbackCorrespondent } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')
const { createOrganisationLog } = require('../../services/auditLog')
const { ENABLE_CORRESPONDENT_MANAGEMENT } = require('../../util/config')

const addOrganisationFeedbackCorrespondent = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { userId } = req.body

  const { organisation } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  const userToAdd = await User.findByPk(userId)
  if (!userToAdd) {
    throw new ApplicationError(`User not found`, 400)
  }
  if (await userToAdd.hasOrganisation(organisation)) {
    throw new ApplicationError(`User already is feedback correspondent of that organisation`, 400)
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

  return res.send(users)
}

const removeOrganisationFeedbackCorrespondent = async (req, res) => {
  const { user } = req
  const { code, userId } = req.params

  const { organisation } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  const userToRemove = await User.findByPk(userId)
  if (!userToRemove) {
    throw new ApplicationError(`User ${userId} not found`, 400)
  }
  if (!(await userToRemove.hasOrganisation(organisation))) {
    throw new ApplicationError('User is not feedback correspondent of that organisation', 400)
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

  return res.send(users)
}

const router = Router()

if (ENABLE_CORRESPONDENT_MANAGEMENT) {
  router.post('/:code/feedback-correspondents', addOrganisationFeedbackCorrespondent)
  router.delete('/:code/feedback-correspondents/:userId', removeOrganisationFeedbackCorrespondent)
}

module.exports = router
