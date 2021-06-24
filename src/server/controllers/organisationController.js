const _ = require('lodash')

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

  const updates = _.pick(body, ['studentListVisible', 'disabledCourseCodes'])

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

  Object.assign(organisation, updates)

  const updatedOrganisation = await organisation.save()

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

module.exports = {
  getOrganisations,
  updateOrganisation,
  getOrganisationByCode,
}
