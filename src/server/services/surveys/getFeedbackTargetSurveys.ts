import { getProgrammeSurveysByCourseUnit } from './programmeSurvey'
import { getOrCreateTeacherSurvey } from './teacherSurvey'
import { getUniversitySurvey } from './universitySurvey'
import { CourseRealisation, FeedbackTarget } from '../../models'

export const getFeedbackTargetSurveys = async (feedbackTarget: FeedbackTarget) => {
  const curStartDate =
    feedbackTarget.courseRealisation?.startDate ??
    (await CourseRealisation.findByPk(feedbackTarget.courseRealisationId, { attributes: ['startDate'] }))?.startDate

  if (!curStartDate) {
    throw new Error(`CourseRealisation.startDate not found for FeedbackTarget ${feedbackTarget.id}`)
  }

  const [programmeSurveys, teacherSurvey, universitySurvey] = await Promise.all([
    getProgrammeSurveysByCourseUnit(feedbackTarget.courseUnitId),
    getOrCreateTeacherSurvey(feedbackTarget),
    getUniversitySurvey(curStartDate),
  ])

  if (feedbackTarget.userCreated) {
    universitySurvey.questionIds = []
    universitySurvey.questions = []

    return {
      programmeSurveys: [],
      teacherSurvey,
      universitySurvey,
    }
  }

  return {
    programmeSurveys,
    teacherSurvey,
    universitySurvey,
  }
}
