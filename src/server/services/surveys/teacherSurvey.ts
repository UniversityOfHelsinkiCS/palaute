import { Question, Survey } from '../../models'
import type { FeedbackTarget } from '../../models/feedbackTarget'

/**
 *
 * @param {Survey} previousSurvey
 * @returns {Promise<number[]>} questionIds
 */
const getClonedQuestionIds = async (previousSurvey: Survey): Promise<number[]> => {
  if (!previousSurvey) return []

  const previousQuestions = await Question.findAll({
    where: {
      id: previousSurvey.questionIds,
    },
  })

  const clonedQuestions = await Question.bulkCreate(
    previousQuestions.map(({ type, secondaryType, required, data }) => ({
      type,
      secondaryType,
      required,
      data,
    })),
    { returning: true }
  )

  return clonedQuestions.map(q => q.id)
}

/**
 *
 * @param {number} feedbackTargetId
 * @param {Survey} previousSurvey
 * @returns {Promise<Survey>} new survey
 */
const createTeacherSurvey = async (feedbackTargetId: number, previousSurvey: Survey): Promise<Survey> => {
  const clonedQuestionIds = await getClonedQuestionIds(previousSurvey)

  const teacherSurvey = await Survey.create({
    feedbackTargetId,
    questionIds: clonedQuestionIds,
  })

  return teacherSurvey
}

/**
 *
 * @param {FeedbackTarget} feedbackTarget
 * @returns {Promise<Survey>} teacher survey
 */
export const getOrCreateTeacherSurvey = async (feedbackTarget: FeedbackTarget): Promise<Survey> => {
  const existingTeacherSurvey = await Survey.findOne({
    where: {
      feedbackTargetId: feedbackTarget.id,
    },
  })

  let teacherSurvey = null

  if (existingTeacherSurvey) {
    teacherSurvey = existingTeacherSurvey
  } else {
    const previousFeedbackTarget = await feedbackTarget.getPrevious()
    const previousSurvey = previousFeedbackTarget
      ? await Survey.findOne({
          where: {
            feedbackTargetId: previousFeedbackTarget.id,
          },
        })
      : null

    teacherSurvey = await createTeacherSurvey(feedbackTarget.id, previousSurvey)
  }

  await teacherSurvey.populateQuestions()
  return teacherSurvey
}
