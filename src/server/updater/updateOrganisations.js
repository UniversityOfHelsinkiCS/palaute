const { Organisation } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const organisationsHandler = async (organisations) => {
  await Organisation.bulkCreate(organisations, {
    updateOnDuplicate: ['name', 'code'],
  })
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationsHandler)
}

module.exports = updateOrganisations
