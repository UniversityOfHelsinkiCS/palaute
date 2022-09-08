/* eslint-disable max-len */
const { format } = require('date-fns')
const jwt = require('jsonwebtoken')

const { JWT_KEY, NOAD_LINK_EXPIRATION_DAYS } = require('../util/config')
const {
  buildNotificationAboutFeedbackResponseToStudents,
  buildReminderAboutSurveyOpeningToTeachers,
  buildReminderAboutFeedbackResponseToTeachers,
  buildNotificationAboutSurveyOpeningToStudents,
} = require('./emailBuilder')
const { sendEmail } = require('./pate')

const sendNotificationAboutFeedbackResponseToStudents = async (
  urlToSeeFeedbackSummary,
  students,
  courseName,
  startDate,
  endDate,
  feedbackResponse,
) => {
  const translations = buildNotificationAboutFeedbackResponseToStudents(
    courseName,
    startDate,
    endDate,
    urlToSeeFeedbackSummary,
    feedbackResponse,
  )

  const emails = students.map((student) => {
    const email = {
      to: student.email,
      subject:
        translations.subject[student.language] || translations.subject.en,
      text: translations.text[student.language] || translations.text.en,
    }
    return email
  })

  await sendEmail(emails, 'Notify students about counter feedback')

  return emails
}

const emailReminderAboutSurveyOpeningToTeachers = (
  emailAddress,
  teacherFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language
    ? teacherFeedbackTargets[0].language
    : 'en'
  const courseName = teacherFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  // Sort them so they come neatly in order in the email
  teacherFeedbackTargets.sort((a, b) =>
    a.name[language]?.localeCompare(b.name[language]),
  )

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt, closesAt } = feedbackTarget
    const humanOpensAtDate = format(new Date(opensAt), 'dd.MM.yyyy')
    const humanClosesAtDate = format(new Date(closesAt), 'dd.MM.yyyy')

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

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/edit`}>
        ${name[language]}
        </a> (${openFrom[language]} ${closesOn[language]}) <br/>`
  }

  const translations = buildReminderAboutSurveyOpeningToTeachers(
    courseNamesAndUrls,
    courseName,
    hasMultipleFeedbackTargets,
  )

  const email = {
    to: emailAddress,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const emailReminderAboutFeedbackResponseToTeachers = (
  teacher,
  feedbackTarget,
  allTeachers,
) => {
  const { language } = teacher

  const courseName = feedbackTarget.courseUnit.name[language || 'en']

  const courseNamesAndUrls = `<a href=${`https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/feedback-response`}>
      ${feedbackTarget.courseRealisation.name[language]}
      </a> <br/>`

  const translations = buildReminderAboutFeedbackResponseToTeachers(
    courseNamesAndUrls,
    courseName,
    allTeachers,
  )

  const email = {
    to: teacher.email,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

const getNoAdUrl = (username, userId, days) => {
  const token = jwt.sign({ username }, JWT_KEY, { expiresIn: `${days}d` })
  return `https://coursefeedback.helsinki.fi/noad/token/${token}?userId=${userId}`
}

const getFeedbackTargetLink = (feedbackTarget) => {
  const { noAdUser, possiblyNoAdUser, name, username, userId, id, closesAt } =
    feedbackTarget
  const language = feedbackTarget.language ? feedbackTarget.language : 'en'

  const closeDate = new Date(closesAt)
  const formattedCloseDate = format(closeDate, 'dd.MM.yyyy')
  const expirationDate = (() => {
    const d = new Date(closeDate)
    d.setDate(d.getDate() + NOAD_LINK_EXPIRATION_DAYS)
    return d
  })()
  const formattedExpirationDate = format(expirationDate, 'dd.MM.yyyy')
  const daysUntilExpiration = (() => {
    const ms = expirationDate.getTime() - Date.now()
    return ms / 1000 / 3600 / 24
  })()

  const openUntil = {
    en: `Open until ${formattedCloseDate}`,
    fi: `Avoinna ${formattedCloseDate} asti`,
    sv: `Öppet till ${formattedCloseDate}`,
  }
  const adLinkInfo = {
    en: 'If you have a university ad-account',
    fi: 'Jos sinulla on yliopiston ad-tunnus',
    sv: 'Om du har ett universitets ad-konto',
  }
  const noAdLinkInfo = {
    en: 'If you do not have a university ad-account',
    fi: 'Jos sinulla ei ole yliopiston ad-tunnusta',
    sv: 'Om du inte har ett universitets ad-konto',
  }
  const linkText = {
    en: 'use this link',
    fi: 'käytä tätä linkkiä',
    sv: 'använd denhär länken',
  }
  const noAdLinkExpirationInfo = {
    en: `expires ${formattedExpirationDate}`,
    fi: `vanhenee ${formattedExpirationDate}`,
    sv: `går ut ${formattedExpirationDate}`,
  }

  if (noAdUser) {
    const noAdUrl = getNoAdUrl(username, userId, daysUntilExpiration)
    return `<i><a href=${noAdUrl}>${name[language]}</a></i> (${openUntil[language]})<br/>`
  }
  if (possiblyNoAdUser) {
    const adUrl = `https://coursefeedback.helsinki.fi/targets/${id}/feedback`
    const noAdUrl = getNoAdUrl(username, userId, daysUntilExpiration)
    return `<i>${name[language]}</i> (${openUntil[language]})<br/>${adLinkInfo[language]}, <a href=${adUrl}>${linkText[language]}</a> 
        ${noAdLinkInfo[language]}, <a href=${noAdUrl}>${linkText[language]}</a> (${noAdLinkExpirationInfo[language]})<br/>`
  }

  const adUrl = `https://coursefeedback.helsinki.fi/targets/${id}/feedback`
  return `<i><a href=${adUrl}>${name[language]}</a></i> (${openUntil[language]})<br/>`
}

const notificationAboutSurveyOpeningToStudents = (
  emailAddress,
  studentFeedbackTargets,
) => {
  const { language, name } = studentFeedbackTargets[0]
  const hasMultipleFeedbackTargets = studentFeedbackTargets.length > 1

  const emailLanguage = !language ? 'en' : language

  const courseName = name[emailLanguage]
    ? name[emailLanguage]
    : Object.values(name)[0]

  let courseNamesAndUrls = ''

  for (const feedbackTarget of studentFeedbackTargets) {
    courseNamesAndUrls = `${courseNamesAndUrls}${getFeedbackTargetLink(
      feedbackTarget,
    )}`
  }

  const translations = buildNotificationAboutSurveyOpeningToStudents(
    courseNamesAndUrls,
    courseName,
    hasMultipleFeedbackTargets,
  )

  const email = {
    to: emailAddress,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
  }

  return email
}

module.exports = {
  sendNotificationAboutFeedbackResponseToStudents,
  emailReminderAboutSurveyOpeningToTeachers,
  notificationAboutSurveyOpeningToStudents,
  emailReminderAboutFeedbackResponseToTeachers,
}
