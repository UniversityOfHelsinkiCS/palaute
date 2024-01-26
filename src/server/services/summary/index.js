const getCourseRealisationSummaries = require('./courseRealisationSummary')
const {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
} = require('./getOrganisationSummary')
const { getTeacherSummary } = require('./getTeacherSummary')
const { getUserOrganisationSummaries } = require('./getUserOrganisationSummary')

module.exports = {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getCourseRealisationSummaries,
}
