import { deleteTeacher } from './deleteTeacher'
import { getByOrganisation, getPublicByOrganisation } from './getByOrganisation'
import { getFeedbacks } from './getFeedbacks'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { getForCourseRealisation } from './getForCourseRealisation'
import { getForCourseUnit } from './getForCourseUnit'
import { getForStudent } from './getForStudent'
import { getLogs } from './getLogs'
import { getOneForUser, getAdditionalDataFromCacheOrDb } from './getOneForUser'
import { getStudents } from './getStudents'
import { getStudentTokens } from './getStudentTokens'
import { hideFeedback } from './hideFeedback'
import { notGivingFeedback } from './notGivingFeedback'
import { remindStudentsOnFeedback } from './remindStudentsOnFeedback'
import { update } from './update'
import { updateFeedbackResponse } from './updateFeedbackResponse'

export {
  getFeedbacks as getFeedbacksForUserById,
  getOneForUser as getFeedbackTargetForUserById,
  getAdditionalDataFromCacheOrDb as cacheFeedbackTargetById,
  updateFeedbackResponse,
  update as updateFeedbackTarget,
  deleteTeacher,
  getStudents as getStudentsForFeedbackTarget,
  getForStudent as getFeedbackTargetsForStudent,
  getForCourseRealisation as getFeedbackTargetsForCourseRealisation,
  getLogs as getFeedbackTargetLogs,
  getStudentTokens as getStudentTokensForFeedbackTarget,
  remindStudentsOnFeedback,
  getForCourseUnit as getFeedbackTargetsForCourseUnit,
  getByOrganisation as getFeedbackTargetsForOrganisation,
  getPublicByOrganisation as getPublicFeedbackTargetsForOrganisation,
  hideFeedback,
  notGivingFeedback,
  getFeedbackTargetContext,
}
