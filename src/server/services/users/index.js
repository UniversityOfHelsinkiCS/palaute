const { getByUsername: getUserByUsername } = require('./getByName')
const { getUserPreferences } = require('./preferences')
const { updateFeedbackCorrespondent } = require('./updateFeedbackCorrespondent')

module.exports = {
  getUserByUsername,
  getUserPreferences,
  updateFeedbackCorrespondent,
}
