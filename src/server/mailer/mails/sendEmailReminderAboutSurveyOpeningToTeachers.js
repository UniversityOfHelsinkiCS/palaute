const { addDays, format } = require('date-fns')
const { Op } = require('sequelize')
const { FeedbackTarget, CourseRealisation, CourseUnit, Organisation, User } = require('../../models')
const {
  TEACHER_REMINDER_DAYS_TO_OPEN,
  PUBLIC_URL,
  FEEDBACK_SYSTEM,
  SHOW_COURSE_CODES_WITH_COURSE_NAMES,
} = require('../../util/config')
const { pate } = require('../pateClient')
const { createRecipientsForFeedbackTargets } = require('./util')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')
const { getOrCreateTeacherSurvey } = require('../../services/surveys')

const getFeedbackTargetsAboutToOpenForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: addDays(new Date(), TEACHER_REMINDER_DAYS_TO_OPEN),
        [Op.gt]: new Date(),
      },
      feedbackOpeningReminderEmailSent: false,
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
        attributes: ['id', 'username', 'email', 'language', 'secondaryEmail'],
        through: {
          where: {
            accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER'] },
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter(target => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(org => org.disabledCourseCodes)
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  await Promise.all(
    filteredFeedbackTargets.map(async target => {
      const srv = await getOrCreateTeacherSurvey(target)
      target.set(
        'questions',
        srv.questions?.filter(q => q.data.type !== 'TEXT')
      )
    })
  )

  return filteredFeedbackTargets
}

const emailReminderAboutSurveyOpeningToTeachers = (emailAddress, teacherFeedbackTargets) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language ? teacherFeedbackTargets[0].language : 'en'
  const t = i18n.getFixedT(language)
  const courseName = getLanguageValue(teacherFeedbackTargets[0].name, language)
  const { courseCode } = teacherFeedbackTargets[0].courseUnit

  let courseNamesAndUrls = ''

  // Sort them so they come neatly in order in the email
  teacherFeedbackTargets.sort((a, b) => a.name[language]?.localeCompare(b.name[language]))

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt, closesAt, teacherQuestions } = feedbackTarget
    const humanOpensAtDate = format(new Date(opensAt), 'dd.MM.yyyy')
    const humanClosesAtDate = format(new Date(closesAt), 'dd.MM.yyyy')
    const fbtCourseCode = feedbackTarget.courseUnit.courseCode

    let displayName = ''
    if (SHOW_COURSE_CODES_WITH_COURSE_NAMES) {
      displayName = `${fbtCourseCode} ${getLanguageValue(name, language)}`
    } else {
      displayName = `${getLanguageValue(name, language)}`
    }

    const openFrom = {
      en: `Open from ${humanOpensAtDate} `,
      fi: `Palautejakso auki ${humanOpensAtDate}`,
      sv: `Öppnas ${humanOpensAtDate} och `,
    }

    const closesOn = {
      en: `to ${humanClosesAtDate}`,
      fi: `- ${humanClosesAtDate}`,
      sv: `stängs ${humanClosesAtDate}`,
    }

    const questionsText = `${t('mails:reminderAboutSurveyOpeningToTeachers:questionsText')}
      - ${teacherQuestions?.length > 0 ? teacherQuestions.map(q => getLanguageValue(q.data.label, language)).join('<br/>- ') : ''}`

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`${PUBLIC_URL}/targets/${id}/edit`}>
        ${displayName}
        </a> (${openFrom[language]} ${closesOn[language]})
        ${teacherQuestions.length > 0 ? questionsText : ''} <br/>`
  }

  const subject = hasMultipleFeedbackTargets
    ? t('mails:reminderAboutSurveyOpeningToTeachers:subjectMultiple')
    : t('mails:reminderAboutSurveyOpeningToTeachers:subject', { courseName, courseCode })

  const email = {
    to: emailAddress,
    subject,
    text: t('mails:reminderAboutSurveyOpeningToTeachers:text', { courseNamesAndUrls, FEEDBACK_SYSTEM }),
  }

  return email
}

const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teachersWithFeedbackTargets = await createRecipientsForFeedbackTargets(feedbackTargets, { primaryOnly: true })

  const emailsToBeSent = Object.keys(teachersWithFeedbackTargets).map(teacher =>
    emailReminderAboutSurveyOpeningToTeachers(teacher, teachersWithFeedbackTargets[teacher])
  )

  const ids = feedbackTargets.map(target => target.id)

  FeedbackTarget.update(
    {
      feedbackOpeningReminderEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }
  )

  await pate.send(emailsToBeSent, 'Remind teachers about feedback opening')

  return emailsToBeSent
}

module.exports = {
  getFeedbackTargetsAboutToOpenForTeachers, // used by stats
  emailReminderAboutSurveyOpeningToTeachers, // used by stats
  sendEmailReminderAboutSurveyOpeningToTeachers,
}
