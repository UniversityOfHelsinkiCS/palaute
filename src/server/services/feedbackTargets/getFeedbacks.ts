import _ from 'lodash'

import { FEEDBACK_HIDDEN_STUDENT_COUNT, SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING } from '../../util/config'
import { UserFeedbackTarget, FeedbackTarget, Feedback, CourseRealisation } from '../../models'
import { ApplicationError } from '../../util/customErrors'
import { getAccess } from './getAccess'
import { getAdditionalDataFromCacheOrDb } from './getOneForUser'
import { User } from '../../models/user'
import { PublicFeedback } from '../../models/feedback'

const countGroupsByGroupQuestionAnswer = (studentFeedbackTargets: UserFeedbackTarget[], groupingQuestionId: number) =>
  _.countBy(
    studentFeedbackTargets
      .filter(ufbt => ufbt.feedback)
      .flatMap(ufbt => {
        const answers = ufbt.feedback.data?.find(answer => answer.questionId === groupingQuestionId)?.data ?? []
        return answers
      })
  )

const countGroupsByGroupIds = (studentFeedbackTargets: UserFeedbackTarget[]) =>
  _.countBy(studentFeedbackTargets.filter(ufbt => ufbt.feedback).flatMap(ufbt => ufbt.groupIds))

/**
 * Check that no group has between 1 and 4 feedbacks. This would endanger anonymity.
 * @param {object[]} studentFeedbackTargets
 * @param {number?} groupingQuestionId leave this empty if survey does not have a grouping question
 */
const isGroupsAvailable = (studentFeedbackTargets: UserFeedbackTarget[], groupingQuestionId?: number) => {
  // count how many feedbacks every group has
  const feedbacksGroupIds = groupingQuestionId
    ? countGroupsByGroupQuestionAnswer(studentFeedbackTargets, groupingQuestionId)
    : countGroupsByGroupIds(studentFeedbackTargets)

  // check whether each group has 0 or 5+ feedbacks
  return Object.values(feedbacksGroupIds).every(count => count === 0 || count >= FEEDBACK_HIDDEN_STUDENT_COUNT)
}

const getFeedbackTarget = (id: number, userId: string) =>
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

const getStudentFeedbackTargets = async (feedbackTargetId: number) => {
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

const filterByGroupId = (
  studentFeedbackTargets: UserFeedbackTarget[],
  groupId: string | undefined,
  groupsAvailable: boolean,
  groupingQuestionId?: number
) => {
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

/**
 * Shuffle feedbacks so that answers from the same student are not identifiable.
 */
const shuffleFeedbacks = (feedbacks: PublicFeedback[], questionIds: number[]) => {
  const shuffledAnswers = _.shuffle(feedbacks.flatMap(({ data }) => data))
  const answersByQuestion = _.groupBy(shuffledAnswers, 'questionId')

  const shuffledFeedbacks = Array.from(feedbacks, feedback => feedback).map((feedback, i) => ({
    ...feedback,
    data: questionIds.map(questionId => answersByQuestion?.[questionId]?.[i] ?? { questionId, data: '' }),
  }))

  return shuffledFeedbacks
}

const getPublicFeedbacks = (allFeedbacks: PublicFeedback[], publicQuestionIds: number[]) =>
  allFeedbacks.map(feedback => ({
    ...feedback,
    data: feedback.data.filter(answer => !answer.hidden && publicQuestionIds.includes(answer.questionId)),
  }))

const getGroupingQuestion = (surveys: any) =>
  surveys.teacherSurvey?.questions?.find((q: any) => q.secondaryType === 'GROUPING')

/**
 *
 * @param {number} id feedback target id
 * @param {object} user
 * @param {string?} groupId
 * @returns
 */
const getFeedbacks = async (id: number, user: User, groupId?: string) => {
  let feedbackTargetsToShow: UserFeedbackTarget[] = []

  const [feedbackTarget, additionalData] = await Promise.all([
    getFeedbackTarget(id, user.id),
    getAdditionalDataFromCacheOrDb(id),
  ])

  if (!feedbackTarget) ApplicationError.NotFound()

  const { publicQuestionIds, surveys, questions } = additionalData
  const { feedbackVisibility, userFeedbackTargets } = feedbackTarget
  const userFeedbackTarget = userFeedbackTargets[0]

  const access = await getAccess({
    userFeedbackTarget,
    user,
    feedbackTarget,
  })

  if (
    (!access?.canSeePublicFeedbacks() && feedbackVisibility !== 'ALL') ||
    ((access as any).accessStatus === 'STUDENT' &&
      !feedbackTarget.isEnded &&
      SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING)
  ) {
    return {
      feedbacks: [] as any[],
      feedbackVisible: false,
      accessStatus: null as any,
    }
  }

  const studentFeedbackTargets = await getStudentFeedbackTargets(id)
  feedbackTargetsToShow = studentFeedbackTargets

  // Hide feedbacks for small courses to protect anonymity unless consent has been given (consent has been required to give feedback since 10/06/2025)
  if (studentFeedbackTargets.length < FEEDBACK_HIDDEN_STUDENT_COUNT) {
    const feedbacksGivenWithConsent = studentFeedbackTargets.filter(
      fbt => Date.parse((fbt as any).dataValues.updatedAt) > Date.parse('2025-06-10T12:00:00Z')
    )

    if (feedbacksGivenWithConsent.length > 0) {
      feedbackTargetsToShow = feedbacksGivenWithConsent
    } else {
      return {
        feedbacks: [] as any[],
        feedbackVisible: false,
        accessStatus: null as any,
      }
    }
  }

  const groupingQuestionId = getGroupingQuestion(surveys)?.id
  // const groupsAvailable = isGroupsAvailable(studentFeedbackTargets, groupingQuestionId)
  const groupsAvailable = isGroupsAvailable(feedbackTargetsToShow, groupingQuestionId)

  const studentFeedbackTargetsOfGroup = filterByGroupId(
    feedbackTargetsToShow, //studentFeedbackTargets,
    groupId,
    groupsAvailable,
    groupingQuestionId
  )

  const studentCountOfGroup = studentFeedbackTargetsOfGroup.length

  const allFeedbacks = studentFeedbackTargetsOfGroup
    .filter(ufbt => ufbt.feedback)
    .map(ufbt => ufbt.feedback.toPublicObject())

  const questionIds = questions.filter(({ type }) => type !== 'TEXT').map(({ id: qId }) => qId)
  const shuffledFeedbacks = shuffleFeedbacks(allFeedbacks, questionIds)

  if (access.canSeeAllFeedbacks()) {
    return {
      feedbacks: shuffledFeedbacks,
      feedbackVisible: true,
      accessStatus: access,
      groupsAvailable,
      studentCount: studentCountOfGroup,
    }
  }

  const publicFeedbacks = getPublicFeedbacks(shuffledFeedbacks, publicQuestionIds)

  return {
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    accessStatus: access,
    groupsAvailable,
    studentCount: studentCountOfGroup,
  }
}

export { getFeedbacks }
