const _ = require('lodash')
const { subDays } = require('date-fns')
const { Op } = require('sequelize')
const { ContinuousFeedback, FeedbackTarget, CourseRealisation, User, UserFeedbackTarget } = require('../../models')
const logger = require('../../util/logger')
const { pate } = require('../pateClient')
const { PUBLIC_URL } = require('../../util/config')

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
            accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
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

const buildContinuousFeedbackDigestToTeachers = (
  courseNameLinksAndNewFeedback,
  courseName,
  hasMultipleFeedbackTargets
) => {
  const translations = {
    text: {
      en: `Dear teacher! <br/>
      The following courses have received new continuous feedback:
      ${courseNameLinksAndNewFeedback}`,
      fi: `Hyvä opettaja! <br/>
      Seuraaville kurseille on annettu uutta jatkuvaa palautetta:
      ${courseNameLinksAndNewFeedback}`,
      sv: `Dear teacher! <br/>
      The following courses have received new continuous feedback:
      ${courseNameLinksAndNewFeedback}`,
    },
    subject: {
      en: hasMultipleFeedbackTargets
        ? `New continuous feedback for your courses`
        : `New continuous feedback for the course ${courseName}`,
      fi: hasMultipleFeedbackTargets
        ? `Uutta jatkuvaa palautetta opettamillesi kursseille`
        : `Uutta jatkuvaa palautetta opettamallesi kurssille ${courseName}`,
      sv: hasMultipleFeedbackTargets
        ? `New continuous feedback for your courses`
        : `New continuous feedback for the course ${courseName}`,
    },
  }

  return translations
}

const emailContinuousFeedbackDigestToTeachers = teacher => {
  const { language, userFeedbackTargets, email: teacherEmail } = teacher

  const hasMultipleFeedbackTargets = userFeedbackTargets.length > 1

  const courseName = userFeedbackTargets[0].courseRealisation.name[language]

  let courseNameLinksAndNewFeedback = ''
  for (const userFeedbackTarget of userFeedbackTargets) {
    const { feedbackTargetId: id } = userFeedbackTarget
    const name = userFeedbackTarget.courseRealisation.name[language]

    courseNameLinksAndNewFeedback = `${courseNameLinksAndNewFeedback}
    <a href=${`${PUBLIC_URL}/targets/${id}/continuous-feedback`}>${name}</a>
    <ul>
    ${userFeedbackTarget.continuousFeedback.map(({ data }) => `<li>${data}</li>`).join('')}
    </ul>`
  }

  const translations = buildContinuousFeedbackDigestToTeachers(
    courseNameLinksAndNewFeedback,
    courseName,
    hasMultipleFeedbackTargets
  )

  const email = {
    to: teacherEmail,
    subject: translations.subject[language] || translations.subject.en,
    text: translations.text[language] || translations.text.en,
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
