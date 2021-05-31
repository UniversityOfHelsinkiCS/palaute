const { Organisation } = require('../models')
const mangleData = require('./updateLooper')

const organisationsHandler = async (organisations) => {
  const ids = new Set() // TODO fix
  const uniqueOrganisations = organisations.filter((org) => {
    if (!ids.has(org.id)) {
      ids.add(org.id)
      return true
    }
    return false
  })
  await Organisation.bulkCreate(uniqueOrganisations, {
    updateOnDuplicate: ['name', 'code', 'parentId'],
  })
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationsHandler)
}

module.exports = updateOrganisations
