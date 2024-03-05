const _ = require('lodash')
const { subDays } = require('date-fns')
const { Op } = require('sequelize')
const { ContinuousFeedback, FeedbackTarget, CourseRealisation, User, UserFeedbackTarget } = require('../../models')
const logger = require('../../util/logger')
const { pate } = require('../pateClient')
const { PUBLIC_URL } = require('../../util/config')
const { i18n } = require('../../util/i18n')
const { getLanguageValue } = require('../../util/languageUtils')

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
  const teachersWithContinuousFeedback = teachers.map(({ dataValues: teacher }) => ({
    ...teacher,
    userFeedbackTargets: teacher.userFeedbackTargets.map(({ dataValues: ufbt }) => ({
      ...ufbt,
      courseRealisation: courseRealisations.find(({ feedbackTargetId }) => feedbackTargetId === ufbt.feedbackTargetId),
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

const emailContinuousFeedbackDigestToTeachers = teacher => {
  const { language, userFeedbackTargets, email: teacherEmail } = teacher

  const hasMultipleFeedbackTargets = userFeedbackTargets.length > 1

  const courseName = getLanguageValue(userFeedbackTargets[0].courseRealisation.name, language)

  let courseNameLinksAndNewFeedback = ''
  for (const userFeedbackTarget of userFeedbackTargets) {
    const { feedbackTargetId: id } = userFeedbackTarget
    const name = getLanguageValue(userFeedbackTarget.courseRealisation.name, language)

    courseNameLinksAndNewFeedback = `${courseNameLinksAndNewFeedback}
    <a href=${`${PUBLIC_URL}/targets/${id}/continuous-feedback`}>${name}</a>
    <ul>
    ${userFeedbackTarget.continuousFeedback.map(({ data }) => `<li>${data}</li>`).join('')}
    </ul>`
  }

  const t = i18n.getFixedT(language)
  const subject = hasMultipleFeedbackTargets
    ? t('mails:continuousFeedbackDigest:subjectMultiple')
    : t('mails:continuousFeedbackDigest:subject', { courseName })

  const email = {
    to: teacherEmail,
    subject,
    text: t('mails:continuousFeedbackDigest:text', { courseNameLinksAndNewFeedback }),
  }

  return email
}

const sendEmailContinuousFeedbackDigestToTeachers = async () => {
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

module.exports = {
  sendEmailContinuousFeedbackDigestToTeachers,
}
