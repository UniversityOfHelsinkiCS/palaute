const _ = require('lodash')
const { Router } = require('express')

const {
  Organisation,
  OrganisationLog,
  User,
  OrganisationFeedbackCorrespondent,
} = require('../../models')

const { ApplicationError } = require('../../util/customErrors')
const { createOrganisationLog } = require('../../util/auditLog')
const getOpenFeedbackByOrganisation = require('./getOpenFeedbackByOrganisation')

const getAccessAndOrganisation = async (user, code, requiredAccess) => {
  const organisationAccess = await user.getOrganisationAccess()

  const { access, organisation } =
    organisationAccess.find(({ organisation }) => organisation.code === code) ??
    {}

  const hasReadAccess = Boolean(access?.read)
  const hasWriteAccess = Boolean(access?.write)
  const hasAdminAccess = Boolean(access?.admin)

  const missingRights = []
  if (requiredAccess?.read && !hasReadAccess) missingRights.push('read')
  if (requiredAccess?.write && !hasWriteAccess) missingRights.push('write')
  if (requiredAccess?.admin && !hasAdminAccess) missingRights.push('admin')

  if (missingRights.length > 0) {
    throw new ApplicationError(
      `User is missing rights for organisation ${code}: ${missingRights.join(
        ', ',
      )}`,
    )
  }

  return {
    organisation,
    hasReadAccess,
    hasWriteAccess,
    hasAdminAccess,
  }
}

const getUpdatedCourseCodes = async (updatedCourseCodes, organisation) => {
  const organisationCourseCodes = await organisation.getCourseCodes()

  return _.uniq(
    updatedCourseCodes.filter((c) => organisationCourseCodes.includes(c)),
  )
}

const getOrganisations = async (req, res) => {
  const { user, headers, isAdmin } = req

  const isEmployee = Boolean(headers?.employeenumber)

  if (!isAdmin && !isEmployee) {
    return res.send([])
  }

  const organisationAccess = await user.getOrganisationAccess()

  const organisations = organisationAccess.map(({ organisation, access }) => ({
    ...organisation.toJSON(),
    access,
  }))

  return res.send(organisations)
}

const updateOrganisation = async (req, res) => {
  const { user, body } = req
  const { code } = req.params

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(
    user,
    code,
    { write: true },
  )

  const updates = _.pick(body, [
    'studentListVisible',
    'disabledCourseCodes',
    'studentListVisibleCourseCodes',
    'publicQuestionIds',
  ])

  if (
    !hasAdminAccess &&
    (updates.disabledCourseCodes || updates.studentListVisibleCourseCodes)
  ) {
    throw new ApplicationError(
      403,
      'Course codes can only be updated by organisation admins',
    )
  }

  if (updates.disabledCourseCodes) {
    updates.disabledCourseCodes = await getUpdatedCourseCodes(
      updates.disabledCourseCodes,
      organisation,
    )
  }

  if (updates.studentListVisibleCourseCodes) {
    updates.studentListVisibleCourseCodes = await getUpdatedCourseCodes(
      updates.studentListVisibleCourseCodes,
      organisation,
    )
  }

  await createOrganisationLog(organisation, updates, user)

  Object.assign(organisation, updates)

  const updatedOrganisation = await organisation.save()

  return res.send(updatedOrganisation)
}

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
    throw new ApplicationError(
      `User already is feedback correspondent of that organisation`,
      400,
    )
  }

  await OrganisationFeedbackCorrespondent.create({
    organisationId: organisation.id,
    userId,
  })

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
    throw new ApplicationError(
      'User is not feedback correspondent of that organisation',
      400,
    )
  }

  await OrganisationFeedbackCorrespondent.destroy({
    where: {
      organisationId: organisation.id,
      userId,
    },
  })

  const users = await organisation.getUsers()

  return res.send(users)
}

const getOrganisationByCode = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const theOrganisationAccess = organisationAccess.find(
    ({ organisation }) => organisation.code === code,
  )

  if (!theOrganisationAccess) {
    throw new ApplicationError(
      `Organisation by code ${code} is not found or it is not accessible`,
      404,
    )
  }

  const { organisation, access } = theOrganisationAccess

  const publicOrganisation = {
    ...organisation.toJSON(),
    access,
  }

  return res.send(publicOrganisation)
}

const getOrganisationLogs = async (req, res) => {
  const { isAdmin } = req
  const { code } = req.params

  if (!isAdmin) {
    return res.send([])
  }

  const { organisationLogs } = await Organisation.findOne({
    where: {
      code,
    },
    attributes: [],
    order: [
      [{ model: OrganisationLog, as: 'organisationLogs' }, 'createdAt', 'DESC'],
    ],
    include: {
      model: OrganisationLog,
      as: 'organisationLogs',
      attributes: ['data', 'createdAt'],
      include: {
        model: User,
        as: 'user',
      },
    },
  })

  return res.send(organisationLogs)
}

const getOpenQuestionsByOrganisation = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const access = organisationAccess.filter(
    (org) => org.organisation.code === code,
  )

  if (access.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const codesWithIds = await getOpenFeedbackByOrganisation(code)

  return res.send(codesWithIds)
}

const router = Router()

router.get('/', getOrganisations)
router.put('/:code', updateOrganisation)
router.get('/:code', getOrganisationByCode)
router.get('/:code/open', getOpenQuestionsByOrganisation)
router.get('/:code/logs', getOrganisationLogs)

router.post(
  '/:code/feedback-correspondents',
  addOrganisationFeedbackCorrespondent,
)
router.delete(
  '/:code/feedback-correspondents/:userId',
  removeOrganisationFeedbackCorrespondent,
)

module.exports = router
