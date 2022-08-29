const getOrganisationSummaries = require('./organisationSummary')
const getCourseRealisationSummaries = require('./courseRealisationSummary')
const { REFRESH_VIEWS_QUERY } = require('./sql')

module.exports = {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
  REFRESH_VIEWS_QUERY,
}
