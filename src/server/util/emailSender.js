const { Op } = require('sequelize')
const { addDays, subDays } = require('date-fns')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
} = require('../models')

const getFeedbackTargetsForEmail = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.gt]: subDays(new Date(), 1),
        [Op.lt]: addDays(new Date(), 1),
      },
      closesAt: {
        [Op.gt]: new Date(),
      },
      feedbackOpenNotificationEmailSent: false,
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('September 1, 2021 00:00:00') },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode'],
        include: [
          {
            model: Organisation,
            as: 'organisations',
            required: true,
            attributes: ['disabledCourseCodes'],
          },
        ],
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )

    if (!target.isOpen()) return false

    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const getFeedbackTargetsForReminderEmail = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: addDays(new Date(), 7),
        [Op.gt]: addDays(new Date(), 6),
      },
      feedbackOpeningReminderEmailSent: false,
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('September 1, 2021 00:00:00') },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode'],
        include: [
          {
            model: Organisation,
            as: 'organisations',
            required: true,
            attributes: ['disabledCourseCodes'],
          },
        ],
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

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
