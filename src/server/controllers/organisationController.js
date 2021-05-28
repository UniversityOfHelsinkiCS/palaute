const getOrganisations = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const organisations = organisationAccess.map(({ organisation, access }) => ({
    ...organisation.toJSON(),
    access,
  }))

  res.send(organisations)
}

module.exports = {
  getOrganisations,
}
