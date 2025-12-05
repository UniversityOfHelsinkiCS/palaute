import { addDays, format } from 'date-fns'
import { LanguageId } from '@common/types/common'
import { Op } from 'sequelize'
import { FeedbackTarget, CourseRealisation, CourseUnit, Organisation, User, Summary } from '../../models'
import {
  TEACHER_REMINDER_DAYS_TO_OPEN,
  PUBLIC_URL,
  FEEDBACK_SYSTEM,
  SHOW_COURSE_CODES_WITH_COURSE_NAMES,
  FEEDBACK_HIDDEN_STUDENT_COUNT,
} from '../../util/config'
import { pate } from '../pateClient'
import { createRecipientsForFeedbackTargets, OpeningEmailInfo } from './util'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'
import { getOrCreateTeacherSurvey } from '../../services/surveys'

export const getFeedbackTargetsAboutToOpenForTeachers = async () => {
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
      {
        model: Summary,
        as: 'summary',
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
        srv.questions?.filter(q => q.type !== 'TEXT')
      )
    })
  )

  return filteredFeedbackTargets
}

export const emailReminderAboutSurveyOpeningToTeachers = (
  emailAddress: string,
  teacherFeedbackTargets: OpeningEmailInfo[]
) => {
  const hasMultipleFeedbackTargets = teacherFeedbackTargets.length > 1
  const language = teacherFeedbackTargets[0].language ? teacherFeedbackTargets[0].language : ('en' as LanguageId)
  const t = i18n.getFixedT(language)
  const courseName = getLanguageValue(teacherFeedbackTargets[0].name, language)
  const { courseCode } = teacherFeedbackTargets[0].courseUnit

  const userIsAdministrativePerson = teacherFeedbackTargets.some(fbt => fbt.userIsAdministrativePerson)
  const { userIsNewTeacher } = teacherFeedbackTargets[0]

  let courseNamesAndUrls = ''

  // Sort them so they come neatly in order in the email
  teacherFeedbackTargets.sort((a, b) => a.name[language]?.localeCompare(b.name[language]))

  for (const feedbackTarget of teacherFeedbackTargets) {
    const { id, name, opensAt, closesAt, teacherQuestions, summary } = feedbackTarget

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
      - ${teacherQuestions?.length > 0 ? teacherQuestions.map(q => ('label' in q.data ? getLanguageValue(q.data.label, language) : '')).join('<br/>- ') : ''}`

    const smallCourseWarning = `${t('mails:reminderAboutSurveyOpeningToTeachers:smallCourseWarning', { count: FEEDBACK_HIDDEN_STUDENT_COUNT })}<br/>`

    courseNamesAndUrls = `${courseNamesAndUrls}<a href=${`${PUBLIC_URL}/targets/${id}/edit`}>
        ${displayName}
        </a> (${openFrom[language]} ${closesOn[language]})
        ${summary?.data.studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT ? smallCourseWarning : ''}
        ${teacherQuestions.length > 0 ? `${questionsText}<br/>` : ''}`
  }

  let greeting = t('mails:reminderAboutSurveyOpeningToTeachers:greeting')

  if (userIsAdministrativePerson) {
    greeting = `${greeting} ${t('mails:reminderAboutSurveyOpeningToTeachers:administrativePersonGreetingAddition')}`
  }

  greeting = userIsNewTeacher
    ? `${greeting}, ${t('mails:reminderAboutSurveyOpeningToTeachers:greetingWithWelcome')}`
    : `${greeting}!`

  const subject = hasMultipleFeedbackTargets
    ? t('mails:reminderAboutSurveyOpeningToTeachers:subjectMultiple')
    : t('mails:reminderAboutSurveyOpeningToTeachers:subject', { courseName, courseCode })

  const email = {
    to: emailAddress,
    subject,
    text: t('mails:reminderAboutSurveyOpeningToTeachers:text', { greeting, courseNamesAndUrls, FEEDBACK_SYSTEM }),
  }

  return email
}

export const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teachersWithFeedbackTargets = await createRecipientsForFeedbackTargets(feedbackTargets, {
    primaryOnly: true,
    whereOpenEmailNotSent: false,
  })

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
