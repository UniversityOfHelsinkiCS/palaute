const { Organisation } = require('../models')
const importerClient = require('./importerClient')

const createOrganisations = async () => {
  const { data } = await importerClient.get(`/palaute/organisations`)
  await data.reduce(async (promise, organisation) => {
    await promise
    await Organisation.upsert({
      id: organisation.id,
      name: organisation.name,
      code: organisation.code,
    })
  }, Promise.resolve())
}

module.exports = {
  createOrganisations,
}
