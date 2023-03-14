const _ = require('lodash')
const { UserFeedbackTarget, FeedbackTarget, Feedback, CourseRealisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

/**
 * Check that no group has between 1 and 4 feedbacks. This would endanger anonymity.
 * @param {object[]} studentFeedbackTargets
 */
const getGroupsAvailable = studentFeedbackTargets => {
  // count how many feedbacks every group has
  const feedbacksGroupIds = _.countBy(
    studentFeedbackTargets.filter(ufbt => ufbt.feedback).flatMap(ufbt => ufbt.groupIds)
  )
  // check whether each group has 0 or 5+ feedbacks
  return Object.values(feedbacksGroupIds).every(count => count === 0 || count >= 5)
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

  const studentFeedbackTargetsOfGroup =
    groupId && groupsAvailable
      ? studentFeedbackTargets.filter(ufbt => ufbt.groupIds.includes(groupId))
      : studentFeedbackTargets

  const studentCountOfGroup = studentFeedbackTargetsOfGroup.length

  const allFeedbacks = studentFeedbackTargetsOfGroup
    .filter(ufbt => ufbt.feedback)
    .map(ufbt => ufbt.feedback.toPublicObject())

  if (access.canSeeAllFeedbacks()) {
    return {
      feedbacks: allFeedbacks,
      feedbackVisible: true,
      accessStatus: access,
      groupsAvailable,
      studentCount: studentCountOfGroup,
    }
  }

  const { publicQuestionIds } = additionalData
  const publicFeedbacks = getPublicFeedbacks(allFeedbacks, publicQuestionIds)

  return {
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    accessStatus: access,
    groupsAvailable,
    studentCount: studentCountOfGroup,
  }
}

module.exports = { getFeedbacks }
