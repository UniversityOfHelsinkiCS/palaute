const { Op } = require('sequelize')
const _ = require('lodash')

const { Survey, Question, Organisation, OrganisationLog, FeedbackTargetLog, User } = require('../models')

const createOrganisationSurveyLog = async (survey, questions, user) => {
  let previousQuestions = await Question.findAll({
    where: {
      id: { [Op.in]: survey.questionIds },
    },
    attributes: ['id', 'type', 'data', 'required'],
  })
  previousQuestions = previousQuestions.map(question => question.dataValues)

  questions = questions.map(({ id, type, data, required }) => ({
    id,
    type,
    data,
    required,
  }))

  const organisation = await Organisation.findOne({
    where: {
      code: survey.typeId,
    },
    attributes: ['id'],
  })

  const deletedQuestions = previousQuestions.filter(question => !questions.find(q => q.id === question.id))

  for (const question of deletedQuestions) {
    const data = {
      deleteQuestion: {
        id: question.id,
        type: question.type,
        ...question.data,
      },
    }

    await OrganisationLog.create({
      data,
      organisationId: organisation.id,
      userId: user.id,
    })
  }

  for (const question of questions) {
    let data
    if (question.id) {
      const previousQuestion = previousQuestions.find(q => q.id === question.id)
      // Get the changed values of the question
      const difference = _.fromPairs(_.differenceWith(_.toPairs(question), _.toPairs(previousQuestion), _.isEqual))
      // eslint-disable-next-line no-continue
      if (Object.keys(difference).length === 0) continue

      const label = previousQuestion.data.label || previousQuestion.data.content
      data = {
        updateQuestion: {
          id: question.id,
          previousLabel: label && (label.en || label.fi || label.sv),
          ...difference,
        },
      }
    } else {
      data = {
        createQuestion: {
          id: question.id,
          ...question.data,
          type: question.type,
          required: question.required,
        },
      }
    }

    await OrganisationLog.create({
      data,
      organisationId: organisation.id,
      userId: user.id,
    })
  }
}

const createFeedbackTargetSurveyLog = async (surveyId, questions, user) => {
  const survey = await Survey.findByPk(surveyId, {
    attributes: ['id', 'feedbackTargetId', 'questionIds'],
  })

  let previousQuestions = await Question.findAll({
    where: {
      id: { [Op.in]: survey.questionIds },
    },
    attributes: ['id', 'type', 'data', 'required'],
  })
  previousQuestions = previousQuestions.map(question => question.dataValues)

  questions = questions.map(({ id, type, data, required }) => ({
    id,
    type,
    data,
    required,
  }))

  const deletedQuestions = previousQuestions.filter(question => !questions.find(q => q.id === question.id))

  for (const question of deletedQuestions) {
    const data = {
      deleteQuestion: {
        id: question.id,
        type: question.type,
        ...question.data,
      },
    }

    await FeedbackTargetLog.create({
      data,
      feedbackTargetId: survey.feedbackTargetId,
      userId: user.id,
    })
  }

  for (const question of questions) {
    let data
    if (question.id) {
      const previousQuestion = previousQuestions.find(q => q.id === question.id)
      // Get the changed values of the question
      const difference = _.fromPairs(_.differenceWith(_.toPairs(question), _.toPairs(previousQuestion), _.isEqual))

      // eslint-disable-next-line no-continue
      if (Object.keys(difference).length === 0) continue

      const label = previousQuestion.data.label || previousQuestion.data.content
      data = {
        updateQuestion: {
          id: question.id,
          previousLabel: label && (label.en || label.fi || label.sv),
          ...difference,
        },
      }
    } else {
      data = {
        createQuestion: {
          id: question.id,
          ...question.data,
          type: question.type,
          required: question.required,
        },
      }
    }

    await FeedbackTargetLog.create({
      data,
      feedbackTargetId: survey.feedbackTargetId,
      userId: user.id,
    })
  }
}

const createOrganisationLog = async (organisation, updates, user) => {
  const data = {}

  if (Array.isArray(updates.disabledCourseCodes)) {
    data.disabledCourseCodes = _.difference(updates.disabledCourseCodes, organisation.disabledCourseCodes)
    data.enabledCourseCodes = _.difference(organisation.disabledCourseCodes, updates.disabledCourseCodes)
  }

  if (Array.isArray(updates.studentListVisibleCourseCodes)) {
    data.enabledStudentList = _.difference(
      updates.studentListVisibleCourseCodes,
      organisation.studentListVisibleCourseCodes
    )
    data.disabledStudentList = _.difference(
      organisation.studentListVisibleCourseCodes,
      updates.studentListVisibleCourseCodes
    )
  }

  if (Array.isArray(updates.publicQuestionIds)) {
    data.addedPublicQuestionIds = _.difference(updates.publicQuestionIds, organisation.publicQuestionIds)
    data.removedPublicQuestionIds = _.difference(organisation.publicQuestionIds, updates.publicQuestionIds)
  }

  if (updates.studentListVisible !== undefined) data.studentListVisible = Boolean(updates.studentListVisible)

  if (updates.responsibleUserId !== undefined) {
    data.newFeedbackCorrespondent = await User.findByPk(updates.responsibleUserId, {
      attributes: ['id', 'firstName', 'lastName'],
    })
  }

  await OrganisationLog.create({
    data,
    organisationId: organisation.id,
    userId: user.id,
  })
}

const createFeedbackTargetLog = async (feedbackTarget, updates, user) => {
  const data = {}

  if (Array.isArray(updates.publicQuestionIds)) {
    const enabledPublicQuestionIds = _.difference(updates.publicQuestionIds, feedbackTarget.publicQuestionIds)
    const disabledPublicQuestionIds = _.difference(feedbackTarget.publicQuestionIds, updates.publicQuestionIds)

    data.enabledPublicQuestions = await Question.findAll({
      where: { id: enabledPublicQuestionIds },
      attributes: ['id', 'data'],
    })
    data.disabledPublicQuestions = await Question.findAll({
      where: { id: disabledPublicQuestionIds },
      attributes: ['id', 'data'],
    })
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

  if (Object.keys(data).length === 0) return

  await FeedbackTargetLog.create({
    data,
    feedbackTargetId: feedbackTarget.id,
    userId: user.id,
  })
}

module.exports = {
  createOrganisationSurveyLog,
  createFeedbackTargetSurveyLog,
  createOrganisationLog,
  createFeedbackTargetLog,
}
