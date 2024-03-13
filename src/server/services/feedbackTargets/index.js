const { getOneForUser, getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

const { getFeedbacks } = require('./getFeedbacks')

const { updateFeedbackResponse } = require('./updateFeedbackResponse')

const { update } = require('./update')
const { getStudents } = require('./getStudents')
const { getForStudent } = require('./getForStudent')
const { getForCourseRealisation } = require('./getForCourseRealisation')
const { getLogs } = require('./getLogs')
const { deleteTeacher } = require('./deleteTeacher')
const { getStudentTokens } = require('./getStudentTokens')
const { remindStudentsOnFeedback } = require('./remindStudentsOnFeedback')
const { getForCourseUnit } = require('./getForCourseUnit')
const { getByOrganisation } = require('./getByOrganisation')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')
const { hideFeedback } = require('./hideFeedback')
const cache = require('./cache')

module.exports = {
  getFeedbacksForUserById: getFeedbacks,
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
  updateFeedbackResponse,
  updateFeedbackTarget: update,
  deleteTeacher,
  getStudentsForFeedbackTarget: getStudents,
  getFeedbackTargetsForStudent: getForStudent,
  getFeedbackTargetsForCourseRealisation: getForCourseRealisation,
  getFeedbackTargetLogs: getLogs,
  getStudentTokensForFeedbackTarget: getStudentTokens,
  remindStudentsOnFeedback,
  getFeedbackTargetsForCourseUnit: getForCourseUnit,
  getFeedbackTargetsForOrganisation: getByOrganisation,
  hideFeedback,
  getFeedbackTargetContext,
  feedbackTargetCache: cache,
}
