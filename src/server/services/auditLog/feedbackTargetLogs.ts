import _ from 'lodash'
import { Question, FeedbackTargetLog, FeedbackTarget, User } from '../../models'

const createFromData = async (feedbackTargetId: number, user: User, data: object) => {
  const logData: any = { ...data }
  if (user.mockedBy) {
    logData.mockedBy = user.mockedBy.username
  }

  const log = await FeedbackTargetLog.create({
    data: logData,
    feedbackTargetId: String(feedbackTargetId),
    userId: String(user.id),
  })

  return log
}

export const createFeedbackTargetSurveyLog = async (
  feedbackTargetId: number,
  user: User,
  removedIds: number[],
  newIds: number[]
) => {
  const data: any = {}

  if (removedIds.length > 0) {
    const removedQuestions = await Question.findAll({
      where: { id: removedIds },
      attributes: ['id', 'data'],
    })

    data.deleteQuestion = removedQuestions[0].data
    data.deleteQuestion.id = removedQuestions[0].id
  }

  if (newIds.length > 0) {
    const addedQuestions = await Question.findAll({
      where: { id: newIds },
      attributes: ['id', 'data'],
    })

    data.createQuestion = addedQuestions[0].data
    data.createQuestion.id = addedQuestions[0].id
  }

  if (Object.keys(data).length === 0) return

  await createFromData(feedbackTargetId, user, data)
}

export const createFeedbackTargetLog = async (feedbackTarget: FeedbackTarget, updates: any, user: User) => {
  const data: any = {}

  if (Array.isArray(updates.publicQuestionIds)) {
    const enabledPublicQuestionIds = _.difference(updates.publicQuestionIds, feedbackTarget.publicQuestionIds).filter(
      (qId: number) => (updates.questions?.length ? updates.questions.some((q: any) => q.id === qId) : true)
    )

    const disabledPublicQuestionIds = _.difference(feedbackTarget.publicQuestionIds, updates.publicQuestionIds).filter(
      (qId: number) => (updates.questions?.length ? updates.questions.some((q: any) => q.id === qId) : true)
    )

    if (enabledPublicQuestionIds.length > 0) {
      data.enabledPublicQuestions = await Question.findAll({
        where: { id: enabledPublicQuestionIds },
        attributes: ['id', 'data'],
      })
    }

    if (disabledPublicQuestionIds.length > 0) {
      data.disabledPublicQuestions = await Question.findAll({
        where: { id: disabledPublicQuestionIds },
        attributes: ['id', 'data'],
      })
    }
  }

  if (updates.opensAt && new Date(updates.opensAt).toDateString() !== feedbackTarget.opensAt.toDateString()) {
    data.opensAt = updates.opensAt
  }

  if (updates.closesAt && new Date(updates.closesAt).toDateString() !== feedbackTarget.closesAt.toDateString()) {
    data.closesAt = updates.closesAt
  }

  if (updates.feedbackVisibility) {
    data.feedbackVisibility = updates.feedbackVisibility
  }

  if (updates.openImmediately !== undefined) {
    data.openImmediately = updates.openImmediately
  }

  if (updates.continuousFeedbackEnabled !== undefined) {
    data.continuousFeedbackEnabled = updates.continuousFeedbackEnabled
  }

  if (updates.sendContinuousFeedbackDigestEmails !== undefined) {
    data.sendContinuousFeedbackDigestEmails = updates.sendContinuousFeedbackDigestEmails
  }

  if (Object.keys(data).length === 0) return

  await createFromData(feedbackTarget.id, user, data)
}

interface FeedbackResponseLogData {
  feedbackTarget: FeedbackTarget
  user: User
  responseText: string
  previousResponse: string
  sendEmail: boolean
}

export const createFeedbackResponseLog = async ({
  feedbackTarget,
  user,
  responseText,
  previousResponse,
  sendEmail,
}: FeedbackResponseLogData) => {
  const data: any = {}

  if (previousResponse?.length > 0 && responseText?.length > 0) {
    data.feedbackResponse = 'updated'
  } else if (responseText?.length > 0) {
    data.feedbackResponse = 'created'
  }

  if (sendEmail) {
    data.sendFeedbackResponseEmail = true
  }

  await createFromData(feedbackTarget.id, user, data)
}
