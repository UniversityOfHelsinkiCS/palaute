const getSummaryAccessibleOrganisationIds = async user => {
  const organisationAccess = await user.getOrganisationAccess()
  const accessibleOrganisationIds = organisationAccess.flatMap(access => [
    access.organisation.id,
    access.organisation.parentId,
  ])

  return accessibleOrganisationIds
}

module.exports = {
  getSummaryAccessibleOrganisationIds,
}
