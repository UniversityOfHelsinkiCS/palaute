const getOrganisations = async (req, res) => {
  const { user, headers } = req

  const isEmployee = Boolean(headers?.employeenumber)

  if (!isEmployee) {
    return res.send([])
  }

  const organisationAccess = await user.getOrganisationAccess()

  const organisations = organisationAccess.map(({ organisation, access }) => ({
    ...organisation.toJSON(),
    access,
  }))

  return res.send(organisations)
}

module.exports = {
  getOrganisations,
}
