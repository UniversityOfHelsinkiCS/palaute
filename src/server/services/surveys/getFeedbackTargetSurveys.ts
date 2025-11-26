import { getProgrammeSurveysByCourseUnit } from './programmeSurvey'
import { getOrCreateTeacherSurvey } from './teacherSurvey'
import { getUniversitySurvey } from './universitySurvey'
import { FeedbackTarget } from '../../models'

export const getFeedbackTargetSurveys = async function (feedbackTarget: FeedbackTarget) {
  const [programmeSurveys, teacherSurvey, universitySurvey] = await Promise.all([
    getProgrammeSurveysByCourseUnit(feedbackTarget.courseUnitId),
    getOrCreateTeacherSurvey(feedbackTarget),
    getUniversitySurvey(),
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
