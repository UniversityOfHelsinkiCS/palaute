const { UserFeedbackTarget, FeedbackTarget, Feedback, CourseRealisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

const getFeedbackTarget = (id, userId) =>
  FeedbackTarget.findByPk(id, {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        where: {
          userId,
        },
        required: false,
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
    ],
  })

const getStudentFeedbacks = async feedbackTargetId => {
  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
    include: {
      model: Feedback,
      required: true,
      as: 'feedback',
    },
  })

  return studentFeedbackTargets.map(t => t.feedback.toPublicObject())
}

const getPublicFeedbacks = (allFeedbacks, publicQuestionIds) =>
  allFeedbacks.map(feedback => ({
    ...feedback,
    data: feedback.data.filter(answer => !answer.hidden && publicQuestionIds.includes(answer.questionId)),
  }))

const getFeedbacks = async (id, user) => {
  const [feedbackTarget, additionalData] = await Promise.all([
    getFeedbackTarget(id, user.id),
    getAdditionalDataFromCacheOrDb(id),
  ])

  if (!feedbackTarget) ApplicationError.NotFound()

  const { feedbackVisibility, userFeedbackTargets } = feedbackTarget
  const userFeedbackTarget = userFeedbackTargets[0]

  const access = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
  })

  if (!access?.canSeePublicFeedbacks() && feedbackVisibility !== 'ALL') {
    return {
      feedbacks: [],
      feedbackVisible: false,
      accessStatus: null,
    }
  }

  const allStudentFeedbacks = await getStudentFeedbacks(id)

  if (access.canSeeAllFeedbacks()) {
    return {
      feedbacks: allStudentFeedbacks,
      feedbackVisible: true,
      accessStatus: access,
    }
  }

  const { publicQuestionIds } = additionalData
  const publicFeedbacks = getPublicFeedbacks(allStudentFeedbacks, publicQuestionIds)

  return {
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    accessStatus: access,
  }
}

module.exports = { getFeedbacks }
