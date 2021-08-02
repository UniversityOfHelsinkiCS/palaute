const { Op } = require('sequelize')

const { FeedbackTarget } = require('../models')

const getFeedbackTargetsForEmail = async () => {
  const date = new Date()

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: new Date().setDate(date.getDate() - 1),
      },
      closesAt: {
        [Op.gt]: new Date().setDate(date.getDate() + 1),
      },
      feedbackOpenNotificationEmailSent: {
        [Op.is]: false,
      },
    },
  })

  const filteredFeedbackTargets = feedbackTargets.filter(
    (feedbackTarget) => feedbackTarget.feedbackType === 'courseRealisation',
  )

  return filteredFeedbackTargets
}

const getFeedbackTargetsForReminderEmail = async () => {
  const date = new Date()

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: new Date().setDate(date.getDate() + 7),
        [Op.gt]: new Date(),
      },
      feedbackOpeningReminderEmailSent: {
        [Op.is]: false,
      },
    },
  })

  const filteredFeedbackTargets = feedbackTargets.filter(
    (feedbackTarget) => feedbackTarget.feedbackType === 'courseRealisation',
  )

  return filteredFeedbackTargets
}

const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getFeedbackTargetsForEmail()

  /* eslint-disable */

  for (feedbackTarget of feedbackTargets) {
    if (!feedbackTarget.feedbackOpenNotificationEmailSent) {
      feedbackTarget.feedbackOpenNotificationEmailSent = true
      await feedbackTarget.save()
      await feedbackTarget.sendFeedbackOpenEmailToStudents()
    }
  }

}

const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsForReminderEmail()

  for (feedbackTarget of feedbackTargets) {
    if (!feedbackTarget.feedbackOpeningReminderEmailSent) {
      feedbackTarget.feedbackOpeningReminderEmailSent = true
      await feedbackTarget.save()
      await feedbackTarget.sendFeedbackOpeningReminderEmailToTeachers()
    }
  }

  /* eslint-enable */
}

module.exports = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
}
