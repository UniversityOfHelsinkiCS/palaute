const _ = require('lodash')
const { UserFeedbackTarget, FeedbackTarget, Feedback, CourseRealisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

/**
 * Check whether all groups of feedback target have +5 feedbacks given.
 * @param {object[]} studentFeedbackTargets
 */
const getGroupsAvailable = studentFeedbackTargets => {
  const feedbacksGroupIds = _.countBy(studentFeedbackTargets.flatMap(ufbt => ufbt.groupIds))
  return Object.values(feedbacksGroupIds).every(count => count > 0)
}

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

const getStudentFeedbackTargets = async feedbackTargetId => {
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

  return studentFeedbackTargets
}

const getPublicFeedbacks = (allFeedbacks, publicQuestionIds) =>
  allFeedbacks.map(feedback => ({
    ...feedback,
    data: feedback.data.filter(answer => !answer.hidden && publicQuestionIds.includes(answer.questionId)),
  }))

/**
 *
 * @param {number} id feedback target id
 * @param {object} user
 * @param {string?} groupId
 * @returns
 */
const getFeedbacks = async (id, user, groupId) => {
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

  const studentFeedbackTargets = await getStudentFeedbackTargets(id)
  const groupsAvailable = getGroupsAvailable(studentFeedbackTargets)

  const allStudentFeedbacks = (
    groupId && groupsAvailable
      ? studentFeedbackTargets.filter(ufbt => ufbt.groupIds.includes(groupId))
      : studentFeedbackTargets
  ).map(ufbt => ufbt.feedback.toPublicObject())

  if (access.canSeeAllFeedbacks()) {
    return {
      feedbacks: allStudentFeedbacks,
      feedbackVisible: true,
      accessStatus: access,
      groupsAvailable,
    }
  }

  const { publicQuestionIds } = additionalData
  const publicFeedbacks = getPublicFeedbacks(allStudentFeedbacks, publicQuestionIds)

  return {
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    accessStatus: access,
    groupsAvailable,
  }
}

module.exports = { getFeedbacks }
