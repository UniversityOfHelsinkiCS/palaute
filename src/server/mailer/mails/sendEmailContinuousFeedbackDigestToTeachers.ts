import _ from 'lodash'
import { subDays } from 'date-fns'
import { Op } from 'sequelize'
import {
  ContinuousFeedback,
  FeedbackTarget,
  CourseRealisation,
  User,
  UserFeedbackTarget,
  CourseUnit,
} from '../../models'
import { logger } from '../../util/logger'
import { pate } from '../pateClient'
import { PUBLIC_URL, SHOW_COURSE_CODES_WITH_COURSE_NAMES } from '../../util/config'
import { i18n } from '../../util/i18n'
import { getLanguageValue } from '../../util/languageUtils'

const getTeachersWithContinuousFeedback = async () => {
  const newContinuousFeedback = await ContinuousFeedback.findAll({
    where: {
      createdAt: {
        [Op.gt]: subDays(new Date(), 1),
      },
      sendInDigestEmail: true,
    },
    attributes: ['id', 'data', 'feedbackTargetId'],
  })

  const feedbackTargetIds = newContinuousFeedback.map(({ feedbackTargetId }) => feedbackTargetId)

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      id: {
        [Op.in]: feedbackTargetIds,
      },
      continuousFeedbackEnabled: true,
      sendContinuousFeedbackDigestEmail: true,
    },
    attributes: ['id'],
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: ['id', 'name'],
        required: true,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'courseCode'],
        required: true,
      },
      {
        model: User,
        as: 'users',
        attributes: ['id', 'email', 'secondaryEmail', 'language'],
        required: true,
        include: [
          {
            model: UserFeedbackTarget,
            as: 'userFeedbackTargets',
            where: {
              feedbackTargetId: {
                [Op.in]: feedbackTargetIds,
              },
            },
            attributes: ['id', 'feedbackTargetId'],
            required: true,
          },
        ],
        through: {
          where: {
            accessStatus: 'RESPONSIBLE_TEACHER',
          },
        },
      },
    ],
  })

  const courseRealisations = feedbackTargets.map(({ id, courseRealisation }) => ({
    ...courseRealisation.dataValues,
    feedbackTargetId: id,
  }))

  const teachers = _.uniqBy(
    feedbackTargets.flatMap(({ users }) => users),
    'id'
  )

  // Combine related courseRealisation and continuousFeedbacks under teacher's userFeedbackTargets
  const teachersWithContinuousFeedback = teachers.map(teacher => ({
    ...teacher.dataValues,
    userFeedbackTargets: teacher.userFeedbackTargets.map(({ dataValues: ufbt }) => ({
      ...ufbt,
      courseRealisation: courseRealisations.find(({ feedbackTargetId }) => feedbackTargetId === ufbt.feedbackTargetId),
      courseUnit: feedbackTargets.find(fbt => fbt.id === ufbt.feedbackTargetId).courseUnit,
      continuousFeedback: newContinuousFeedback.filter(
        ({ feedbackTargetId }) => feedbackTargetId === ufbt.feedbackTargetId
      ),
    })),
  }))

  // Remove userFeedbackTargets without courseRealisation
  // related to feedbackTargets with recently disabled continuous feedback or email
  const filteredTeachersWithContinuousFeedback = teachersWithContinuousFeedback.map(data => ({
    ...data,
    userFeedbackTargets: data.userFeedbackTargets.filter(({ courseRealisation }) => courseRealisation),
  }))

  return {
    teachersWithContinuousFeedback: filteredTeachersWithContinuousFeedback,
    newContinuousFeedback,
  }
}

const emailContinuousFeedbackDigestToTeachers = (
  teacher: Awaited<ReturnType<typeof getTeachersWithContinuousFeedback>>['teachersWithContinuousFeedback'][number]
) => {
  const { language, userFeedbackTargets, email: teacherEmail } = teacher

  const hasMultipleFeedbackTargets = userFeedbackTargets.length > 1

  const courseName = getLanguageValue(userFeedbackTargets[0].courseRealisation.name, language)
  const { courseCode } = userFeedbackTargets[0].courseUnit

  let courseNameLinksAndNewFeedback = ''
  for (const userFeedbackTarget of userFeedbackTargets) {
    const { feedbackTargetId: id } = userFeedbackTarget
    let name = ''
    if (SHOW_COURSE_CODES_WITH_COURSE_NAMES) {
      name = `${courseCode} ${getLanguageValue(userFeedbackTarget.courseRealisation.name, language)}`
    } else {
      name = getLanguageValue(userFeedbackTarget.courseRealisation.name, language)
    }

    courseNameLinksAndNewFeedback = `${courseNameLinksAndNewFeedback}
    <a href=${`${PUBLIC_URL}/targets/${id}/continuous-feedback`}>${name}</a>
    <ul>
    ${userFeedbackTarget.continuousFeedback.map(({ data }) => `<li>${data}</li>`).join('')}
    </ul>`
  }

  const t = i18n.getFixedT(language)
  const subject = hasMultipleFeedbackTargets
    ? t('mails:continuousFeedbackDigest:subjectMultiple')
    : t('mails:continuousFeedbackDigest:subject', { courseName, courseCode })

  const email = {
    to: teacherEmail,
    subject,
    text: t('mails:continuousFeedbackDigest:text', { courseNameLinksAndNewFeedback }),
  }

  return email
}

export const sendEmailContinuousFeedbackDigestToTeachers = async () => {
  const { teachersWithContinuousFeedback, newContinuousFeedback } = await getTeachersWithContinuousFeedback()

  const emailsToBeSent = teachersWithContinuousFeedback.map(teacher => emailContinuousFeedbackDigestToTeachers(teacher))

  const continuousFeedbackIds = newContinuousFeedback.map(({ id }) => id)

  logger.info(`[Pate] Sending continuous feedback digests to ${teachersWithContinuousFeedback.length} teachers`)

  ContinuousFeedback.update(
    {
      sendInDigestEmail: false,
    },
    {
      where: {
        id: {
          [Op.in]: continuousFeedbackIds,
        },
      },
    }
  )

  await pate.send(emailsToBeSent, 'Send continuous feedback digest to teachers')

  return emailsToBeSent
}
