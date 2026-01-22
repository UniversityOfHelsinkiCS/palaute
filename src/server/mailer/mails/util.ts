import { format } from 'date-fns'
import jwt from 'jsonwebtoken'
import { LanguageId, LocalizedString } from '@common/types/common'
import { getLanguageValue } from '../../util/languageUtils'
import { JWT_KEY, NOAD_LINK_EXPIRATION_DAYS, PUBLIC_URL, SHOW_COURSE_CODES_WITH_COURSE_NAMES } from '../../util/config'
import { CourseUnit, FeedbackTarget, Question, Summary, User } from '../../models'

const getNoAdUrl = (username: string, userId: string, days: number) => {
  const token = jwt.sign({ username }, JWT_KEY, { expiresIn: `${days}d` })
  return `${PUBLIC_URL}/noad/token/${token}?userId=${userId}`
}

export const getFeedbackTargetLink = (emailInfo: OpeningEmailInfo) => {
  const { noAdUser, possiblyNoAdUser, name, username, userId, id, closesAt } = emailInfo
  const { courseCode } = emailInfo.courseUnit
  const language = emailInfo.language ? emailInfo.language : 'en'

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

  let displayName = ''
  if (SHOW_COURSE_CODES_WITH_COURSE_NAMES) {
    displayName = `${courseCode} ${getLanguageValue(name, language)}`
  } else {
    displayName = getLanguageValue(name, language)
  }

  if (noAdUser) {
    const noAdUrl = getNoAdUrl(username, userId, daysUntilExpiration)
    return `<i><a href=${noAdUrl}>${displayName}</a></i> (${openUntil[language]})<br/>`
  }
  if (possiblyNoAdUser) {
    const adUrl = `${PUBLIC_URL}/targets/${id}/feedback`
    const noAdUrl = getNoAdUrl(username, userId, daysUntilExpiration)
    return `<i>${displayName}</i> (${openUntil[language]})<br/>${adLinkInfo[language]}, <a href=${adUrl}>${linkText[language]}</a> 
        ${noAdLinkInfo[language]}, <a href=${noAdUrl}>${linkText[language]}</a> (${noAdLinkExpirationInfo[language]})<br/>`
  }

  const adUrl = `${PUBLIC_URL}/targets/${id}/feedback`
  return `<i><a href=${adUrl}>${displayName}</a></i> (${openUntil[language]})<br/>`
}

const getFeedbackTargetsWithOpeningReminderSentForTeacher = async (teacherId: string) => {
  const feedbackTargetsWithOpeningReminderSent = await FeedbackTarget.findAll({
    where: {
      feedbackOpeningReminderEmailSent: true,
      feedbackType: 'courseRealisation',
      userCreated: false,
    },
    include: [
      {
        model: User,
        as: 'users',
        attributes: ['id'],
        required: true,
        through: {
          where: {
            accessStatus: 'RESPONSIBLE_TEACHER',
            userId: teacherId,
          },
        },
      },
    ],
  })

  return feedbackTargetsWithOpeningReminderSent
}

export type OpeningEmailInfo = {
  id: number
  userFeedbackTargetId: number
  name: LocalizedString
  opensAt: Date
  closesAt: Date
  language: LanguageId
  noAdUser: boolean
  possiblyNoAdUser: boolean
  userId: string
  username: string
  courseUnit: CourseUnit
  teacherQuestions: Question[]
  summary: Summary
  userIsNewTeacher: boolean
  userIsAdministrativePerson: boolean
}

export const createRecipientsForFeedbackTargets = async (
  feedbackTargets: FeedbackTarget[],
  options = { primaryOnly: false, whereOpenEmailNotSent: false }
) => {
  const emails: Record<string, OpeningEmailInfo[]> = {}

  for (const feedbackTarget of feedbackTargets) {
    for (const user of feedbackTarget.users) {
      if (!(options.whereOpenEmailNotSent && user.UserFeedbackTarget.feedbackOpenEmailSent)) {
        let userIsNewTeacher = false
        if (user.UserFeedbackTarget.dataValues.accessStatus !== 'STUDENT') {
          const feedbackTargetsWithOpeningReminderSent = await getFeedbackTargetsWithOpeningReminderSentForTeacher(
            user.id
          )
          const isNewTeacher = feedbackTargetsWithOpeningReminderSent.length === 0
          if (isNewTeacher) {
            userIsNewTeacher = true
          }
        }

        const certainlyNoAdUser = user.username === user.id
        const possiblyNoAdUser = feedbackTarget.courseRealisation.isMoocCourse && !user.degreeStudyRight

        const sendToBothEmails = !options.primaryOnly && (certainlyNoAdUser || possiblyNoAdUser)

        const userEmails = [user.email, sendToBothEmails ? user.secondaryEmail : undefined]
        // for some users, email === secondaryEmail. In that case, use only primary.
        userEmails[1] = userEmails[0] === userEmails[1] ? undefined : userEmails[1]

        userEmails.filter(Boolean).forEach(email => {
          emails[email] = (emails[email] ? emails[email] : []).concat([
            {
              id: feedbackTarget.id,
              userFeedbackTargetId: user.UserFeedbackTarget.id,
              name: feedbackTarget.courseRealisation.name,
              opensAt: feedbackTarget.opensAt,
              closesAt: feedbackTarget.closesAt,
              language: user.language,
              noAdUser: certainlyNoAdUser,
              possiblyNoAdUser,
              userId: user.id,
              username: user.username,
              courseUnit: feedbackTarget.courseUnit,
              teacherQuestions: feedbackTarget.questions,
              summary: feedbackTarget.summary,
              userIsNewTeacher,
              userIsAdministrativePerson: user.UserFeedbackTarget.dataValues.isAdministrativePerson,
            },
          ])
        })
      }
    }
  }

  return emails
}
