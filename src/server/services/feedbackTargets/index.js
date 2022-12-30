const {
  getOneForUser,
  getAdditionalDataFromCacheOrDb,
} = require('./getOneForUser')

const { getFeedbacks } = require('./getFeedbacks')

const { updateFeedbackResponse } = require('./updateFeedbackResponse')

const { update } = require('./update')

module.exports = {
  getFeedbacksForUserById: getFeedbacks,
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
  updateFeedbackResponse,
  updateFeedbackTarget: update,
}
