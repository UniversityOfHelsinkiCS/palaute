const getCourseRealisationSummaries = require('./courseRealisationSummary')
const {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getUserOrganisationSummaries,
} = require('./summaryV2')
const { getTeacherSummary } = require('./getTeacherSummary')

module.exports = {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getCourseRealisationSummaries,
}
