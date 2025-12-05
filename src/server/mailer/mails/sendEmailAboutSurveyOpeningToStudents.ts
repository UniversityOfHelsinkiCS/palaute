import { Op } from 'sequelize'
import { UserFeedbackTarget, FeedbackTarget, CourseRealisation, CourseUnit, Organisation, User } from '../../models'
import { pate } from '../pateClient'
import { createRecipientsForFeedbackTargets, getFeedbackTargetLink, OpeningEmailInfo } from './util'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'
import { SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE } from '../../util/config'

export const getOpenFeedbackTargetsForStudents = async () => {
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

export const notificationAboutSurveyOpeningToStudents = (emailAddress: string, emailInfos: OpeningEmailInfo[]) => {
  const { language, name } = emailInfos[0]
  const hasMultipleFeedbackTargets = emailInfos.length > 1

  const emailLanguage = !language ? 'en' : language

  const courseName = getLanguageValue(name, emailLanguage)
  const { courseCode } = emailInfos[0].courseUnit

  let courseNamesAndUrls = ''
  const uftIds = []
  for (const emailInfo of emailInfos) {
    courseNamesAndUrls = `${courseNamesAndUrls}${getFeedbackTargetLink(emailInfo)}`
    uftIds.push(emailInfo.userFeedbackTargetId)
  }

  const t = i18n.getFixedT(language)

  const subject = hasMultipleFeedbackTargets
    ? t('mails:surveyOpeningEmailToStudents:subjectMultiple')
    : t('mails:surveyOpeningEmailToStudents:subject', { courseName, courseCode })

  const email = {
    to: emailAddress,
    subject,
    text: t('mails:surveyOpeningEmailToStudents:text', { courseNamesAndUrls }),
    userFeedbackTargetIds: uftIds,
  }

  return email
}

export const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getOpenFeedbackTargetsForStudents()

  const studentsWithFeedbackTargets = await createRecipientsForFeedbackTargets(feedbackTargets, {
    whereOpenEmailNotSent: true,
    primaryOnly: false,
  })

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(student =>
    notificationAboutSurveyOpeningToStudents(student, studentsWithFeedbackTargets[student])
  )

  let chunkSize = SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE
  if (chunkSize === 0) {
    chunkSize = emailsToBeSent.length
  }
  const emailsToBeSentChunks = Array.from({ length: Math.ceil(emailsToBeSent.length / chunkSize) }, (v, i) =>
    emailsToBeSent.slice(i * chunkSize, (i + 1) * chunkSize)
  )

  for (const emailsChunk of emailsToBeSentChunks) {
    const ids = emailsChunk.flatMap(e => e.userFeedbackTargetIds)

    // userFeedbackTargetIds are added in notificationAboutSurveyOpeningToStudents, remove them, they are not needed in pate
    emailsChunk.forEach(e => delete e.userFeedbackTargetIds)
    await pate.send(emailsChunk, 'Notify students about feedback opening')

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
  }

  return emailsToBeSent
}
