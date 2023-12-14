const { createFeedbackTargetSurveyLog, createFeedbackTargetLog } = require('./feedbackTargetLogs')

const { createOrganisationSurveyLog, createOrganisationLog } = require('./organisationLogs')

module.exports = {
  createOrganisationSurveyLog,
  createFeedbackTargetSurveyLog,
  createOrganisationLog,
  createFeedbackTargetLog,
}
