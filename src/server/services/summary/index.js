const getCourseRealisationSummaries = require('./courseRealisationSummary')
const {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
} = require('./getOrganisationSummary')
const { getTeacherSummary } = require('./getTeacherSummary')
const { getUserOrganisationSummaries } = require('./getUserOrganisationSummary')
const { getCourseUnitGroupSummaries } = require('./getCourseUnitGroupSummary')

module.exports = {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummaryWithTags,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getCourseRealisationSummaries,
  getCourseUnitGroupSummaries,
}
