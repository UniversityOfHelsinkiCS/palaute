const { Organisation } = require('../models')
const logger = require('../util/logger')
const mangleData = require('./updateLooper')

const organisationHandler = async (data) => {
  await data.reduce(async (promise, organisation) => {
    await promise
    try {
      await Organisation.upsert({
        id: organisation.id,
        name: organisation.name,
        code: organisation.code,
      })
    } catch (err) {
      logger.info('ERR', err, 'Organisation', organisation)
    }
  }, Promise.resolve())
}

const updateOrganisations = async () => {
  await mangleData('organisations', 3000, organisationHandler)
}

module.exports = updateOrganisations
