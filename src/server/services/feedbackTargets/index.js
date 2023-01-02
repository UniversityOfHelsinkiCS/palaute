const { getOneForUser, getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

const { getFeedbacks } = require('./getFeedbacks')

const { updateFeedbackResponse } = require('./updateFeedbackResponse')

const { update } = require('./update')
const { getStudents } = require('./getStudents')
const { getForStudent } = require('./getForStudent')
const { getAccessForUserById } = require('./getAccess')
const { getForCourseRealisation } = require('./getForCourseRealisation')
const { getLogs } = require('./getLogs')

module.exports = {
  getFeedbacksForUserById: getFeedbacks,
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
  updateFeedbackResponse,
  updateFeedbackTarget: update,
  getStudentsForFeedbackTarget: getStudents,
  getFeedbackTargetsForStudent: getForStudent,
  getFeedbackTargetAccess: getAccessForUserById,
  getFeedbackTargetsForCourseRealisation: getForCourseRealisation,
  getFeedbackTargetLogs: getLogs,
}
