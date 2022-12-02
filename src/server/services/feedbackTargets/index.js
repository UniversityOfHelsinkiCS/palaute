const {
  getOneForUser,
  getAdditionalDataFromCacheOrDb,
} = require('./getOneForUser')

const { getFeedbacks } = require('./getFeedbacks')

module.exports = {
  getFeedbacksForUserById: getFeedbacks,
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
}
