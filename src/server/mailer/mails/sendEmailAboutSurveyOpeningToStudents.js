const { Op } = require('sequelize')
const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
} = require('../../models')
const { pate } = require('../pateClient')
const { createRecipientsForFeedbackTargets, getFeedbackTargetLink } = require('./util')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')

const getOpenFeedbackTargetsForStudents = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lte]: new Date(),
      },
      closesAt: {
        [Op.gte]: new Date(),
      },
      feedbackType: 'courseRealisation',
      userCreated: false,
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
        attributes: ['id', 'username', 'email', 'language', 'degreeStudyRight', 'secondaryEmail'],
        through: {
          where: {
            accessStatus: 'STUDENT',
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter(target => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(org => org.disabledCourseCodes)

    if (!target.isOpen()) return false

    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const notificationAboutSurveyOpeningToStudents = (emailAddress, studentFeedbackTargets) => {
  const { language, name } = studentFeedbackTargets[0]
  const hasMultipleFeedbackTargets = studentFeedbackTargets.length > 1

  const emailLanguage = !language ? 'en' : language

  const courseName = getLanguageValue(name, emailLanguage)
  const { courseCode } = studentFeedbackTargets[0].courseUnit

  let courseNamesAndUrls = ''

  for (const feedbackTarget of studentFeedbackTargets) {
    courseNamesAndUrls = `${courseNamesAndUrls}${getFeedbackTargetLink(feedbackTarget)}`
  }

  const t = i18n.getFixedT(language)

  const subject = hasMultipleFeedbackTargets
    ? t('mails:surveyOpeningEmailToStudents:subjectMultiple')
    : t('mails:surveyOpeningEmailToStudents:subject', { courseName, courseCode })

  const email = {
    to: emailAddress,
    subject,
    text: t('mails:surveyOpeningEmailToStudents:text', { courseNamesAndUrls }),
  }

  return email
}

const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getOpenFeedbackTargetsForStudents()

  const studentsWithFeedbackTargets = await createRecipientsForFeedbackTargets(feedbackTargets, {
    whereOpenEmailNotSent: true,
  })

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(student =>
    notificationAboutSurveyOpeningToStudents(student, studentsWithFeedbackTargets[student])
  )

  const ids = Object.keys(studentsWithFeedbackTargets).flatMap(key =>
    studentsWithFeedbackTargets[key].map(course => course.userFeedbackTargetId)
  )

  await pate.send(emailsToBeSent, 'Notify students about feedback opening')

  await UserFeedbackTarget.update(
    {
      feedbackOpenEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }
  )

  return emailsToBeSent
}

module.exports = {
  getOpenFeedbackTargetsForStudents, // used by stats
  notificationAboutSurveyOpeningToStudents, // used by stats
  sendEmailAboutSurveyOpeningToStudents,
}
