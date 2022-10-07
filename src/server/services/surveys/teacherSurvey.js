const Question = require('../../models/question')
const Survey = require('../../models/survey')

/**
 *
 * @param {Survey} previousSurvey
 * @returns {Promise<number[]>} questionIds
 */
const getClonedQuestionIds = async (previousSurvey) => {
  if (!previousSurvey) return []

  const previousQuestions = await Question.findAll({
    where: {
      id: previousSurvey.questionIds,
    },
  })

  const clonedQuestions = await Question.bulkCreate(
    previousQuestions.map(({ type, required, data }) => ({
      type,
      required,
      data,
    })),
    { returning: true },
  )

  return clonedQuestions.map((q) => q.id)
}

/**
 *
 * @param {number} feedbackTargetId
 * @param {Survey} previousSurvey
 * @returns {Promise<Survey>} new survey
 */
const createTeacherSurvey = async (feedbackTargetId, previousSurvey) => {
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
const getOrCreateTeacherSurvey = async (feedbackTarget) => {
  const previousFeedbackTarget = await feedbackTarget.getPrevious()
  const previousSurvey = previousFeedbackTarget
    ? Survey.findOne({
        where: {
          feedbackTargetId: previousFeedbackTarget.id,
        },
      })
    : null

  const existingTeacherSurvey = await Survey.findOne({
    where: {
      feedbackTargetId: feedbackTarget.id,
    },
  })

  const teacherSurvey =
    existingTeacherSurvey ||
    (await createTeacherSurvey(feedbackTarget.id, await previousSurvey))
  await teacherSurvey.populateQuestions()
  return teacherSurvey
}

module.exports = getOrCreateTeacherSurvey
