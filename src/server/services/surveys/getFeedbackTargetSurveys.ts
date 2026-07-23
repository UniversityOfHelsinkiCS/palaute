import { FeedbackTarget } from '../../models'
import { getProgrammeSurveysByCourseUnit } from './programmeSurvey'
import { getOrCreateTeacherSurvey } from './teacherSurvey'
import { getUniversitySurvey } from './universitySurvey'

export const getFeedbackTargetSurveys = async (feedbackTarget: FeedbackTarget) => {
  const opensAt =
    feedbackTarget?.opensAt ?? (await FeedbackTarget.findByPk(feedbackTarget.id, { attributes: ['opensAt'] }))?.opensAt

  if (!opensAt) {
    throw new Error(`FeedbackTarget.opensAt not found for FeedbackTarget ${feedbackTarget.id}`)
  }

  const [programmeSurveys, teacherSurvey, universitySurvey] = await Promise.all([
    getProgrammeSurveysByCourseUnit(feedbackTarget.courseUnitId),
    getOrCreateTeacherSurvey(feedbackTarget),
    getUniversitySurvey(opensAt),
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
