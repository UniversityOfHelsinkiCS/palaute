/* eslint-disable max-len */
const { subDays } = require('date-fns')
const { Op } = require('sequelize')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
  UserFeedbackTarget,
} = require('../../models')
const { PUBLIC_URL, FEEDBACK_SYSTEM, SHOW_COURSE_CODES_WITH_COURSE_NAMES } = require('../../util/config')
const { pate } = require('../pateClient')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')

const getFeedbackTargetsWithoutResponseForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      closesAt: {
        [Op.lt]: new Date(),
        // Important to have some limit, as it would be weird to send emails for some really old courses by accident. 3 is arbitrary.
        [Op.gt]: subDays(new Date(), 3),
      },
      feedbackType: 'courseRealisation',
      feedbackResponse: null,
      feedbackResponseReminderEmailSent: false,
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode', 'name'],
        include: [
          {
            model: Organisation,
            as: 'organisations',
            required: true,
            attributes: ['disabledCourseCodes'],
          },
        ],
      },
      {
        model: User,
        as: 'users',
        required: true,
        attributes: ['id', 'username', 'email', 'language', 'secondaryEmail', 'firstName', 'lastName'],
        through: {
          where: {
            accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER'] },
          },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        attributes: ['id', 'feedbackId'],
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter(fbt => {
    const disabledCourseCodes = fbt.courseUnit.organisations.flatMap(org => org.disabledCourseCodes)
    const isInterimFeedback = fbt.userCreated && !fbt.courseRealisation.userCreated

    return !disabledCourseCodes.includes(fbt.courseUnit.courseCode) && !isInterimFeedback
  })

  // Check that at least one feedback has been given for the course
  const filteredByFeedbacks = filteredFeedbackTargets.filter(fbt => fbt.userFeedbackTargets.some(uft => uft.feedbackId))

  return filteredByFeedbacks
}

const emailReminderAboutFeedbackResponseToTeachers = (teacher, feedbackTarget, allTeachers) => {
  const { language } = teacher
  const { userCreated } = feedbackTarget
  const courseName = userCreated
    ? getLanguageValue(feedbackTarget.courseRealisation?.name, language)
    : getLanguageValue(feedbackTarget.courseUnit?.name, language)
  const { courseCode } = feedbackTarget.courseUnit

  let courseNamesAndUrlsDisplayName = courseName
  if (SHOW_COURSE_CODES_WITH_COURSE_NAMES) {
    courseNamesAndUrlsDisplayName = `${courseCode} ${courseNamesAndUrlsDisplayName}`
  }

  const courseNamesAndUrls = `<a href=${`${PUBLIC_URL}/targets/${feedbackTarget.id}/results`}>
      ${courseNamesAndUrlsDisplayName}
      </a> <br/>`

  const teachers = allTeachers.map(t => `${t.firstName} ${t.lastName}`)

  const t = i18n.getFixedT(language)

  const email = {
    to: teacher.email,
    subject: t(`mails:counterFeedbackReminder:${userCreated ? 'customSubject' : 'subject'}`, {
      courseName,
      courseCode,
    }),
    text: t(`mails:counterFeedbackReminder:${userCreated ? 'customText' : 'text'}`, {
      courseNamesAndUrls,
      teachers,
      FEEDBACK_SYSTEM,
    }),
  }

  return email
}

const sendEmailReminderAboutFeedbackResponseToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsWithoutResponseForTeachers()

  const emailsToBeSent = feedbackTargets.flatMap(fbt =>
    fbt.users.map(user => emailReminderAboutFeedbackResponseToTeachers(user, fbt, fbt.users))
  )

  const ids = feedbackTargets.map(target => target.id)

  FeedbackTarget.update(
    {
      feedbackResponseReminderEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }
  )

  await pate.send(emailsToBeSent, 'Remind teachers about giving counter feedback')

  return emailsToBeSent
}

module.exports = {
  getFeedbackTargetsWithoutResponseForTeachers, // used by stats
  emailReminderAboutFeedbackResponseToTeachers, // used by stats
  sendEmailReminderAboutFeedbackResponseToTeachers,
}
