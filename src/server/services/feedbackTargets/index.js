const {
  getOneForUser,
  getAdditionalDataFromCacheOrDb,
} = require('./getOneForUser')

module.exports = {
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
}
