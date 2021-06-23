const _ = require('lodash')

const { Organisation } = require('../models')
const { ApplicationError } = require('../util/customErrors')

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
  const { user } = req
  const { code } = req.params

  const organisationAccess = await user.getOrganisationAccess()

  const relevantOrganisationAccess = organisationAccess.find(
    ({ organisation }) => organisation.code === code,
  )

  const hasWriteAccess = Boolean(relevantOrganisationAccess?.access?.write)

  if (!hasWriteAccess) throw new ApplicationError(403, 'Forbidden')

  const organisation = await Organisation.findOne({
    where: {
      code,
    },
  })

  Object.assign(organisation, _.pick(req.body, ['studentListVisible']))

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
