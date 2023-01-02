const _ = require('lodash')
const { startOfDay, endOfDay } = require('date-fns')
const { parseFromTimeZone } = require('date-fns-timezone')
const { getFeedbackTargetContext } = require('./util')
const { ApplicationError } = require('../../util/customErrors')
const { Survey, Question } = require('../../models')
const { createFeedbackTargetSurveyLog, createFeedbackTargetLog } = require('../../util/auditLog')

const parseUpdates = body => {
  const {
    name,
    hidden,
    opensAt,
    closesAt,
    publicQuestionIds,
    feedbackVisibility,
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
    settingsReadByTeacher,
  } = body
  const parseDate = d => parseFromTimeZone(new Date(d), { timeZone: 'Europe/Helsinki' })

  const updates = _.pickBy({
    // cweate obwect fwom only twe twuthy values :3
    name,
    hidden,
    opensAt: opensAt ? startOfDay(parseDate(opensAt)) : undefined,
    closesAt: closesAt ? endOfDay(parseDate(closesAt)) : undefined,
    publicQuestionIds: publicQuestionIds?.filter(id => !!Number(id)),
    feedbackVisibility,
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
    settingsReadByTeacher,
  })

  return updates
}

const parseUpdatedQuestionIds = (updatedPublicQuestionIds, questions, publicQuestionIds) => {
  let currentIds = updatedPublicQuestionIds ?? publicQuestionIds
  const configurable = questions.filter(q => q.publicityConfigurable)
  // remove nonpublic
  currentIds = _.difference(
    currentIds,
    configurable.filter(q => !q.public).map(q => q.id)
  )
  // add public
  currentIds = currentIds.concat(configurable.filter(q => q.public).map(q => q.id))

  return _.uniq(currentIds).filter(Number)
}

const handleListOfUpdatedQuestionsAndReturnIds = async questions => {
  const updatedQuestionIdsList = []

  for (const question of questions) {
    let updatedQuestion
    if (question.id) {
      const [, updatedQuestions] = await Question.update(
        {
          ...question,
        },
        { where: { id: question.id }, returning: true }
      )
      // eslint-disable-next-line prefer-destructuring
      updatedQuestion = updatedQuestions[0]
    } else {
      updatedQuestion = await Question.create({
        ...question,
      })
    }

    updatedQuestionIdsList.push(updatedQuestion.id)
  }

  return updatedQuestionIdsList
}

const updateSurvey = async (feedbackTarget, user, surveyId, questions) => {
  const survey = await Survey.findOne({
    where: {
      id: surveyId,
      feedbackTargetId: feedbackTarget.id,
    },
  })
  if (!survey) ApplicationError.NotFound('Survey not found')
  await createFeedbackTargetSurveyLog(surveyId, questions, user)
  const oldIds = survey.questionIds
  survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(questions)
  // assuming there is only 1 new. Find whether its going to be public, and update publicQuestionIds
  const newIds = _.difference(survey.questionIds, oldIds)

  // remove the deleted question id
  const removedIds = _.difference(oldIds, survey.questionIds)

  const updates = {
    questions,
    newIds,
    removedIds,
  }

  await survey.save()

  return updates
}

const update = async ({ feedbackTargetId, user, body }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access.canUpdate()) {
    ApplicationError.Forbidden('No rights to update feedback target')
  }

  const updates = parseUpdates(body)
  const { questions, surveyId } = body

  if (updates.opensAt || updates.closesAt) {
    if ((updates.opensAt ?? feedbackTarget.opensAt) > (updates.closesAt ?? feedbackTarget.closesAt)) {
      throw new ApplicationError('ClosesAt cannot be before opensAt', 400)
    }
    updates.feedbackDatesEditedByTeacher = true
  }

  if (Array.isArray(questions)) {
    updates.publicQuestionIds = parseUpdatedQuestionIds(
      updates.publicQuestionIds,
      questions,
      feedbackTarget.publicQuestionIds
    )
  }

  if (questions && surveyId) {
    const {
      newIds,
      removedIds,
      questions: updatedQuestions,
    } = await updateSurvey(feedbackTarget, user, surveyId, questions)

    if (newIds.length === 1) {
      const newQuestion = questions.find(q => q.id === undefined)
      if (newQuestion?.public) {
        updates.publicQuestionIds.push(newIds[0])
      }
    }

    updates.publicQuestionIds = updates.publicQuestionIds.filter(id => !removedIds.includes(id))

    updates.questions = updatedQuestions
  }

  Object.assign(feedbackTarget, updates)

  // force hooks
  feedbackTarget.changed('updatedAt', true)

  await feedbackTarget.save()
  await createFeedbackTargetLog(feedbackTarget, updates, user)

  return feedbackTarget
}

module.exports = {
  update,
}
