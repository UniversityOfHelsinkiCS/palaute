const { getOneForUser, getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

const { getFeedbacks } = require('./getFeedbacks')

const { updateFeedbackResponse } = require('./updateFeedbackResponse')

const { update } = require('./update')
const { getStudents } = require('./getStudents')
const { getForStudent } = require('./getForStudent')
const { getAccessForUserById } = require('./getAccess')
const { getForCourseRealisation } = require('./getForCourseRealisation')
const { getLogs } = require('./getLogs')
const { deleteTeacher } = require('./deleteTeacher')
const { getStudentTokens } = require('./getStudentTokens')
const { remindStudentsOnFeedback } = require('./remindStudentsOnFeedback')
const { getForCourseUnit } = require('./getForCourseUnit')
const { getByOrganisation } = require('./getByOrganisation')

module.exports = {
  getFeedbacksForUserById: getFeedbacks,
  getFeedbackTargetForUserById: getOneForUser,
  cacheFeedbackTargetById: getAdditionalDataFromCacheOrDb,
  updateFeedbackResponse,
  updateFeedbackTarget: update,
  deleteTeacher,
  getStudentsForFeedbackTarget: getStudents,
  getFeedbackTargetsForStudent: getForStudent,
  getFeedbackTargetAccess: getAccessForUserById,
  getFeedbackTargetsForCourseRealisation: getForCourseRealisation,
  getFeedbackTargetLogs: getLogs,
  getStudentTokensForFeedbackTarget: getStudentTokens,
  remindStudentsOnFeedback,
  getFeedbackTargetsForCourseUnit: getForCourseUnit,
  getFeedbackTargetsForOrganisation: getByOrganisation,
}
