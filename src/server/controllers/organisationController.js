const _ = require('lodash')
const { Organisation, OrganisationLog, User } = require('../models')

const { ApplicationError } = require('../util/customErrors')

const getUpdatedDisabledCourseCodes = async (
  updatedDisabledCourseCodes,
  organisation,
) => {
  const organisationCourseCodes = await organisation.getCourseCodes()

  return _.uniq(
    updatedDisabledCourseCodes.filter((c) =>
      organisationCourseCodes.includes(c),
    ),
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

const createOrganisationLog = async (organisation, updates, user) => {
  const data = {}

  if (Array.isArray(updates.disabledCourseCodes)) {
    data.disabledCourseCodes = _.difference(
      updates.disabledCourseCodes,
      organisation.disabledCourseCodes,
    )
    data.enabledCourseCodes = _.difference(
      organisation.disabledCourseCodes,
      updates.disabledCourseCodes,
    )
  }

  if (updates.studentListVisible !== undefined)
    data.studentListVisible = Boolean(updates.studentListVisible)

  await OrganisationLog.create({
    data,
    organisationId: organisation.id,
    userId: user.id,
  })
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
  ])

  if (updates.disabledCourseCodes && !hasAdminAccess) {
    throw new ApplicationError(
      403,
      'Disabled course codes can only be updated by organisation admins',
    )
  }

  if (updates.disabledCourseCodes) {
    updates.disabledCourseCodes = await getUpdatedDisabledCourseCodes(
      updates.disabledCourseCodes,
      organisation,
    )
  }

  await createOrganisationLog(organisation, updates, user)

  Object.assign(organisation, updates)

  const updatedOrganisation = await organisation.save()

  if (updates.responsibleUserId) {
    const responsibleUser = await User.findByPk(
      updatedOrganisation.responsibleUserId,
      { attributes: ['id', 'firstName', 'lastName', 'email'] },
    )
    const organisationIncludeUser = {
      ...updatedOrganisation.toJSON(),
      responsible_user: responsibleUser,
    }

    res.send(organisationIncludeUser)
  }

  res.send(updatedOrganisation)
}

const getOrganisationByCode = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const organisation = organisationAccess
    .map(({ organisation, access }) => ({
      ...organisation.toJSON(),
      access,
    }))
    .find((org) => org.code === code)

  if (!organisation) {
    throw new ApplicationError(
      404,
      `Organisation by code ${code} is not found or it is not accessible`,
    )
  }

  res.send(organisation)
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

module.exports = {
  getOrganisations,
  updateOrganisation,
  getOrganisationByCode,
  getOrganisationLogs,
}
