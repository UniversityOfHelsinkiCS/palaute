const { Organisation } = require('../models')
const mangleData = require('./updateLooper')

const organisationsHandler = async (organisations) => {
  await Organisation.bulkCreate(organisations, {
    updateOnDuplicate: ['name', 'code', 'parentId'],
  })
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationsHandler)
}

module.exports = updateOrganisations
