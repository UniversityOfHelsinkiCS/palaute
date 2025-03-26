const _ = require('lodash')
const { startOfDay, endOfDay } = require('date-fns')
const { parseFromTimeZone } = require('date-fns-timezone')
const { getFeedbackTargetContext } = require('./getFeedbackTargetContext')
const { ApplicationError } = require('../../util/customErrors')
const { Survey, Question } = require('../../models')
const { createFeedbackTargetSurveyLog, createFeedbackTargetLog } = require('../auditLog')
const { updateOrganisationSurvey } = require('../organisations/organisationSurveys')

const filterUpdates = update => update !== undefined && update !== null

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
    tokenEnrolmentEnabled,
  } = body
  const parseDate = d => parseFromTimeZone(new Date(d), { timeZone: 'Europe/Helsinki' })

  const updates = _.pickBy(
    {
      name,
      hidden,
      opensAt: opensAt ? startOfDay(parseDate(opensAt)) : undefined,
      closesAt: closesAt ? endOfDay(parseDate(closesAt)) : undefined,
      publicQuestionIds: publicQuestionIds?.filter(id => !!Number(id)),
      feedbackVisibility,
      continuousFeedbackEnabled,
      sendContinuousFeedbackDigestEmail,
      settingsReadByTeacher,
      tokenEnrolmentEnabled,
    },
    filterUpdates
  )

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

const validateGroupingQuestions = questions => {
  const tooManyGroupingQuestions = _.countBy(questions, 'secondaryType').GROUPING > 1
  if (tooManyGroupingQuestions) ApplicationError.BadRequest('Maximum of one grouping question is allowed')

  const illegalGroupingQuestion = questions.some(
    q => q.secondaryType === 'GROUPING' && !['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type)
  )
  if (illegalGroupingQuestion)
    ApplicationError.BadRequest('Only single choice and multiple choice may be grouping questions')
}

const handleListOfUpdatedQuestionsAndReturnIds = async questions => {
  validateGroupingQuestions(questions)

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

  createFeedbackTargetSurveyLog(feedbackTarget.id, user, removedIds, newIds)

  return updates
}

const update = async ({ feedbackTargetId, user, body }) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canUpdate()) {
    throw ApplicationError.Forbidden('No rights to update feedback target')
  }

  const updates = parseUpdates(body)
  const { questions, surveyId } = body

  if (updates.opensAt || updates.closesAt) {
    if ((updates.opensAt ?? feedbackTarget.opensAt) > (updates.closesAt ?? feedbackTarget.closesAt)) {
      throw ApplicationError.BadRequest('ClosesAt cannot be before opensAt')
    }
    updates.feedbackDatesEditedByTeacher = true

    // If organisation survey update course realisation activity period as well
    if (feedbackTarget.courseRealisation.userCreated) {
      const activityPeriod = {
        startDate: updates.opensAt,
        endDate: updates.closesAt,
      }
      await updateOrganisationSurvey(feedbackTarget.id, activityPeriod)
    }
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

  // @feat Gradu survey
  if (!feedbackTarget.userCreated && updates.tokenEnrolmentEnabled) {
    throw ApplicationError.Forbidden('Token enrolment can only be enabled for userCreated feedback targets')
  }

  await createFeedbackTargetLog(feedbackTarget, updates, user)

  Object.assign(feedbackTarget, updates)

  // force hooks
  feedbackTarget.changed('updatedAt', true)

  await feedbackTarget.save()

  return feedbackTarget
}

module.exports = {
  update,
}
