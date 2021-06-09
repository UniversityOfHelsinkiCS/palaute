const { Organisation } = require('../models')

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
  const { studentListVisibility } = req.body
  const organisationCode = req.params.code

  const organisationAccess = await user.hasAccessByOrganisation(
    organisationCode,
  )

  if (!organisationAccess) throw new ApplicationError(403, 'Forbidden')

  const organisation = await Organisation.findOne({
    where: {
      code: organisationCode,
    },
  })

  organisation.studentListVisible = !studentListVisibility

  const updatedOrganisation = await organisation.save()

  res.send(updatedOrganisation)
}

module.exports = {
  getOrganisations,
  updateOrganisation,
}
