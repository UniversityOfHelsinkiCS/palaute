const _ = require('lodash')

const { Question, FeedbackTargetLog } = require('../../models')

const createFromData = async (feedbackTargetId, user, data) => {
  if (user.mockedBy) {
    data.mockedBy = user.mockedBy.username
  }

  const log = await FeedbackTargetLog.create({
    data,
    feedbackTargetId,
    userId: user.id,
  })

  return log
}

const createFeedbackTargetSurveyLog = async (feedbackTargetId, user, removedIds, newIds) => {
  const data = {}

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

const createFeedbackTargetLog = async (feedbackTarget, updates, user) => {
  const data = {}

  if (Array.isArray(updates.publicQuestionIds)) {
    const enabledPublicQuestionIds = _.difference(updates.publicQuestionIds, feedbackTarget.publicQuestionIds).filter(
      qId => (updates.questions?.length ? updates.questions.some(q => q.id === qId) : true)
    )

    const disabledPublicQuestionIds = _.difference(feedbackTarget.publicQuestionIds, updates.publicQuestionIds).filter(
      qId => (updates.questions?.length ? updates.questions.some(q => q.id === qId) : true)
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

const createFeedbackResponseLog = async ({ feedbackTarget, user, responseText, previousResponse, sendEmail }) => {
  const data = {}

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

module.exports = {
  createFeedbackTargetSurveyLog,
  createFeedbackTargetLog,
  createFeedbackResponseLog,
}
