const { Organisation } = require('../models')
const mangleData = require('./updateLooper')

const organisationHandler = async (organisation) => {
  const { id, name, code } = organisation
  if (!id) return
  await Organisation.upsert({
    id,
    name,
    code,
  })
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationHandler)
}

module.exports = updateOrganisations
