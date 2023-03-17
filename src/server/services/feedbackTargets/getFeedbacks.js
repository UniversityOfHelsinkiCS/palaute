const _ = require('lodash')
const { UserFeedbackTarget, FeedbackTarget, Feedback, CourseRealisation } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccess } = require('./getAccess')
const { getAdditionalDataFromCacheOrDb } = require('./getOneForUser')

const countGroupsByGroupQuestionAnswer = (studentFeedbackTargets, groupingQuestionId) =>
  _.countBy(
    studentFeedbackTargets
      .filter(ufbt => ufbt.feedback)
      .flatMap(ufbt => {
        const answers = ufbt.feedback.data?.find(answer => answer.questionId === groupingQuestionId)?.data ?? []
        return answers
      })
  )

const countGroupsByGroupIds = studentFeedbackTargets =>
  _.countBy(studentFeedbackTargets.filter(ufbt => ufbt.feedback).flatMap(ufbt => ufbt.groupIds))

/**
 * Check that no group has between 1 and 4 feedbacks. This would endanger anonymity.
 * @param {object[]} studentFeedbackTargets
 * @param {number?} groupingQuestionId leave this empty if survey does not have a grouping question
 */
const getGroupsAvailable = (studentFeedbackTargets, groupingQuestionId) => {
  // count how many feedbacks every group has
  const feedbacksGroupIds = groupingQuestionId
    ? countGroupsByGroupQuestionAnswer(studentFeedbackTargets, groupingQuestionId)
    : countGroupsByGroupIds(studentFeedbackTargets)

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

const filterByGroupId = (studentFeedbackTargets, groupId, groupsAvailable, groupingQuestionId) => {
  //  not requested or not available, do nothing
  if (!groupId || !groupsAvailable) {
    return studentFeedbackTargets
  }

  // grouped by grouping question
  if (groupingQuestionId) {
    return studentFeedbackTargets.filter(ufbt => {
      const groupAnswers = ufbt.feedback?.data?.find(answer => answer.questionId === groupingQuestionId)?.data ?? []
      return groupAnswers.includes(groupId)
    })
  }

  // grouped automatically by group ids
  return studentFeedbackTargets.filter(ufbt => ufbt.groupIds?.includes(groupId))
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
  const groupingQuestionId = additionalData.surveys.teacherSurvey?.questions?.find(q => q.type === 'GROUPING')?.id
  const groupsAvailable = getGroupsAvailable(studentFeedbackTargets, groupingQuestionId)

  const studentFeedbackTargetsOfGroup = filterByGroupId(
    studentFeedbackTargets,
    groupId,
    groupsAvailable,
    groupingQuestionId
  )

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
