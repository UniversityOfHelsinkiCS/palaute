const logger = require('../util/logger')
const { Organisation } = require('../models')
const importerClient = require('../util/importerClient')

const updateOrganisations = async () => {
  logger.info('Starting to update organisations')
  const { data } = await importerClient.get(`/palaute/organisations`)
  const start = new Date()
  await data.reduce(async (promise, organisation) => {
    await promise
    await Organisation.upsert({
      id: organisation.id,
      name: organisation.name,
      code: organisation.code,
    })
  }, Promise.resolve())
  logger.info(
    `Updated ${data.length} organisations at ${(
      (new Date() - start) /
      data.length
    ).toFixed(4)}ms/org, total time ${(new Date() - start) / 1000}s`,
  )
}

module.exports = updateOrganisations
