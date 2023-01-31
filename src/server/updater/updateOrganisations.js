const { Organisation } = require('../models')
const mangleData = require('./mangleData')
const { safeBulkCreate } = require('./util')

const organisationsHandler = async organisations => {
  const ids = new Set()
  const uniqueOrganisations = organisations.filter(org => {
    if (!ids.has(org.id)) {
      ids.add(org.id)
      return true
    }
    return false
  })

  await safeBulkCreate({
    entityName: 'Organisation',
    entities: uniqueOrganisations,
    bulkCreate: async (e, opt) => Organisation.bulkCreate(e, opt),
    fallbackCreate: async (e, opt) => Organisation.create(e, opt),
    options: { updateOnDuplicate: ['name', 'code', 'parentId'] },
  })
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationsHandler)
}

module.exports = updateOrganisations
