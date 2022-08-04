const _ = require('lodash')
const { Router } = require('express')

const { Organisation, OrganisationLog, User } = require('../../models')

const { ApplicationError } = require('../../util/customErrors')
const { createOrganisationLog } = require('../../util/auditLog')
const {
  getOpenFeedbackByOrganisation,
} = require('./getOpenFeedbackByOrganisation')

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

  const organisationAccess = await user.getOrganisationAccess()

  const { access, organisation } =
    organisationAccess.find(({ organisation }) => organisation.code === code) ??
    {}

  const hasWriteAccess = Boolean(access?.write)
  const hasAdminAccess = Boolean(access?.admin)

  if (!hasWriteAccess)
    throw new ApplicationError(
      403,
      'User does not have write access for organisation',
    )

  const updates = _.pick(body, [
    'studentListVisible',
    'responsibleUserId',
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

  if (updates.responsibleUserId !== undefined) {
    const responsibleUser = await User.findByPk(
      updatedOrganisation.responsibleUserId,
      { attributes: ['id', 'firstName', 'lastName', 'email'] },
    )
    const organisationIncludeUser = {
      ...updatedOrganisation.toJSON(),
      responsible_user: responsibleUser,
    }

    return res.send(organisationIncludeUser)
  }

  return res.send(updatedOrganisation)
}

const getOrganisationByCode = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const { organisation, access } = organisationAccess.find(
    ({ organisation }) => organisation.code === code,
  )

  if (!organisation) {
    throw new ApplicationError(
      404,
      `Organisation by code ${code} is not found or it is not accessible`,
    )
  }

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

  const organisationAccess = await user.getOrganisationAccess()

  const { code } = req.params

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

module.exports = router
