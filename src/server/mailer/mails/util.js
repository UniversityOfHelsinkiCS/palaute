const { format } = require('date-fns')
const jwt = require('jsonwebtoken')
const { JWT_KEY, NOAD_LINK_EXPIRATION_DAYS, PUBLIC_URL } = require('../../util/config')

const instructionsAndSupport = {
  en: `Contact support: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
      User instructions: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
      <a href="https://flamma.helsinki.fi/en/group/ajankohtaista/news/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">More information about Norppa in Flamma</a>`,
  fi: `Ota yhteyttä tukeen: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
      Käyttöohje: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
      <a href="https://flamma.helsinki.fi/fi/group/ajankohtaista/uutinen/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Lisätietoja Norpasta Flammassa</a>`,
  sv: `Kontakta stödet: <a href="mailto:coursefeedback@helsinki.fi">coursefeedback@helsinki.fi</a> <br/>
      Användarinstruktioner: <a href="https://wiki.helsinki.fi/display/CF">https://wiki.helsinki.fi/display/CF</a> <br/>
      <a href="https://flamma.helsinki.fi/sv/group/ajankohtaista/nyhet/-/uutinen/opiskelijat-saavat-uuden-tyokalun-kurssipalautteen-antoon/20194526">Mer information om Norppa i flamma</a>`,
}

const getNoAdUrl = (username, userId, days) => {
  const token = jwt.sign({ username }, JWT_KEY, { expiresIn: `${days}d` })
  return `${PUBLIC_URL}/noad/token/${token}?userId=${userId}`
}

const getFeedbackTargetLink = feedbackTarget => {
  const { noAdUser, possiblyNoAdUser, name, username, userId, id, closesAt } = feedbackTarget
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
    const adUrl = `${PUBLIC_URL}/targets/${id}/feedback`
    const noAdUrl = getNoAdUrl(username, userId, daysUntilExpiration)
    return `<i>${name[language]}</i> (${openUntil[language]})<br/>${adLinkInfo[language]}, <a href=${adUrl}>${linkText[language]}</a> 
        ${noAdLinkInfo[language]}, <a href=${noAdUrl}>${linkText[language]}</a> (${noAdLinkExpirationInfo[language]})<br/>`
  }

  const adUrl = `${PUBLIC_URL}/targets/${id}/feedback`
  return `<i><a href=${adUrl}>${name[language]}</a></i> (${openUntil[language]})<br/>`
}

const createRecipientsForFeedbackTargets = async (
  feedbackTargets,
  options = { primaryOnly: false, whereOpenEmailNotSent: false }
) => {
  // Leo if you are reading this you are allowed to refactor :)
  // Too late 😤

  const emails = {}

  feedbackTargets.forEach(feedbackTarget => {
    feedbackTarget.users
      .filter(options.whereOpenEmailNotSent ? u => !u.UserFeedbackTarget.feedbackOpenEmailSent : () => true)
      .forEach(user => {
        const certainlyNoAdUser = user.username === user.id
        const possiblyNoAdUser = feedbackTarget.courseRealisation.isMoocCourse && !user.degreeStudyright

        const sendToBothEmails = !options.primaryOnly && (certainlyNoAdUser || possiblyNoAdUser)

        const userEmails = [user.email, sendToBothEmails ? user.secondaryEmail : false]
        // for some users, email === secondaryEmail. In that case, use only primary.
        userEmails[1] = userEmails[0] === userEmails[1] ? false : userEmails[1]

        userEmails.filter(Boolean).forEach(email => {
          emails[email] = (emails[email] ? emails[email] : []).concat([
            {
              id: feedbackTarget.id,
              userFeedbackTargetId: user.UserFeedbackTarget.id,
              name: feedbackTarget.courseUnit.name,
              opensAt: feedbackTarget.opensAt,
              closesAt: feedbackTarget.closesAt,
              language: user.language,
              noAdUser: certainlyNoAdUser,
              possiblyNoAdUser,
              userId: user.id,
              username: user.username,
            },
          ])
        })
      })
  })

  return emails
}

module.exports = {
  instructionsAndSupport,
  createRecipientsForFeedbackTargets,
  getFeedbackTargetLink,
}
