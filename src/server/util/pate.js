/* eslint-disable max-len */
const axios = require('axios')
const { format } = require('date-fns')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const Sentry = require('@sentry/node')

const { inProduction, inStaging } = require('../../config')
const logger = require('./logger')
const { JWT_KEY, NOAD_LINK_EXPIRATION_DAYS } = require('./config')
const {
  buildNotificationAboutFeedbackResponseToStudents,
  buildReminderToGiveFeedbackToStudents,
  buildReminderAboutSurveyOpeningToTeachers,
  buildReminderAboutFeedbackResponseToTeachers,
  buildNotificationAboutSurveyOpeningToStudents,
} = require('./emailBuilder')

const template = {
  from: 'Norppa',
}

const settings = {
  hideToska: false,
  disableToska: true,
  color: '#107eab',
  header: 'Norppa',
  headerFontColor: 'white',
  dryrun: !inProduction || inStaging,
}

const pateClient = axios.create({
  baseURL: 'https://importer.cs.helsinki.fi/api/pate',
  params: {
    token: process.env.API_TOKEN,
  },
})

const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time))

const postWithRetries = async (data, retries = 3) => {
  let i = 0
  while (i < retries) {
    try {
      await pateClient.post('/', data)
      break
    } catch (error) {
      Sentry.captureException(error)
      logger.error(
        `[Pate] error when posting emails, retrying ${
          i + 1
        }/${retries}: ${error}`,
      )
      await sleep(4000 + i * 6000)
    }
    i++
  }
}

const sendToPate = async (options = {}) => {
  if (!inProduction || inStaging) {
    logger.debug('Skipped sending email in non-production environment', options)
    logger.debug('Would send', options.emails.length, 'emails')
    // options.emails.forEach((e) => console.log(JSON.stringify(e, null, 2)))
    return null
  }

  logger.info(`sending email to: ${options.emails.length}`)

  const chunkedEmails = _.chunk(options.emails, 40)
  const chunkedOptions = chunkedEmails.map((emails) => ({
    emails,
    settings: options.settings,
    template: options.template,
  }))

  for (const chunkedOption of chunkedOptions) {
    postWithRetries(chunkedOption, 3)
    await sleep(1000)
  }

  return options
}

const sendEmail = async (listOfEmails) => {
  const options = {
    template: {
      ...template,
    },
    emails: listOfEmails,
    settings: { ...settings },
  }

  sendToPate(options)
}

const sendNotificationAboutFeedbackResponseToStudents = (
  urlToSeeFeedbackSummary,
  students,
  courseName,
  feedbackResponse,
) => {
  const translations = buildNotificationAboutFeedbackResponseToStudents(
    courseName,
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

  sendEmail(emails)

  return emails
}

const sendReminderToGiveFeedbackToStudents = (
  urlToGiveFeedback,
  students,
  courseName,
  reminder,
  closesAt,
) => {
  const translations = buildReminderToGiveFeedbackToStudents(
    urlToGiveFeedback,
    courseName,
    reminder,
    closesAt,
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

  sendEmail(emails)

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
  emailAddress,
  teacherFeedbackTargets,
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language
    ? teacherFeedbackTargets[0].language
    : 'en'
  const courseName = teacherFeedbackTargets[0].name[language]

  let courseNamesAndUrls = ''

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name } = feedbackTarget

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`https://coursefeedback.helsinki.fi/targets/${id}/feedback-response`}>
      ${name[language]}
      </a> <br/>`
  }

  const translations = buildReminderAboutFeedbackResponseToTeachers(
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
  return `<i><a href=${adUrl}>${name[language]}</a></i> (${openUntil[language]}) (${noAdLinkExpirationInfo[language]})<br/>`
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
  sendReminderToGiveFeedbackToStudents,
  sendEmail,
}
