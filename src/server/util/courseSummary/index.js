const logger = require('../logger')
const { cacheSummary } = require('./cache')
const {
  getCourseRealisationSummaries,
} = require('./getCourseRealisationSummaries')

const {
  getOrganisationSummaries,
  getSummaryByOrganisation,
  getAllRowsFromDb,
} = require('./getOrganisationSummaries')

const populateCache = async () => {
  console.time('caching')
  const rows = await getAllRowsFromDb()
  await cacheSummary(rows)
  console.timeEnd('caching')
  logger.info(`Populated cache with ${rows.length} rows`)
}

module.exports = {
  getCourseRealisationSummaries,
  getOrganisationSummaries,
  getSummaryByOrganisation,
  populateCache,
}
