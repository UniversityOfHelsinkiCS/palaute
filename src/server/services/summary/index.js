const getCourseRealisationSummaries = require('./courseRealisationSummary')
const {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getTeacherSummary,
  getUserOrganisationSummaries,
} = require('./summaryV2')

module.exports = {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getCourseRealisationSummaries,
}
