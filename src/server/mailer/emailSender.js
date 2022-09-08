const { Op } = require('sequelize')
const { addDays, subDays } = require('date-fns')

const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
  UserFeedbackTarget,
} = require('../models')

const {
  notificationAboutSurveyOpeningToStudents,
  emailReminderAboutSurveyOpeningToTeachers,
  emailReminderAboutFeedbackResponseToTeachers,
  sendNotificationAboutFeedbackResponseToStudents,
} = require('./mails')

const { pate } = require('./pate')

const { ApplicationError } = require('../util/customErrors')
const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')

const getOpenFeedbackTargetsForStudents = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lte]: new Date(),
      },
      closesAt: {
        [Op.gte]: new Date(),
      },
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('August 1, 2021 00:00:00') },
        },
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
        attributes: [
          'id',
          'username',
          'email',
          'language',
          'degreeStudyRight',
          'secondaryEmail',
        ],
        through: {
          where: {
            accessStatus: 'STUDENT',
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )

    if (!target.isOpen()) return false

    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const getFeedbackTargetsAboutToOpenForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.lt]: addDays(new Date(), 7),
        [Op.gt]: addDays(new Date(), 6),
      },
      feedbackOpeningReminderEmailSent: false,
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('August 1, 2021 00:00:00') },
        },
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
            accessStatus: 'TEACHER',
          },
        },
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const getFeedbackTargetOpeningImmediately = async (feedbackTargetId) => {
  const feedbackTarget = await FeedbackTarget.findAll({
    where: {
      id: feedbackTargetId,
      hidden: false,
      feedbackType: 'courseRealisation',
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
      },
    ],
  })

  return feedbackTarget
}

const getFeedbackTargetsWithoutResponseForTeachers = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      closesAt: {
        [Op.lt]: new Date(),
        [Op.gt]: subDays(new Date(), 3),
      },
      hidden: false,
      feedbackType: 'courseRealisation',
      feedbackResponse: null,
      feedbackResponseReminderEmailSent: false,
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('August 1, 2021 00:00:00') },
        },
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
        attributes: [
          'id',
          'username',
          'email',
          'language',
          'secondaryEmail',
          'firstName',
          'lastName',
        ],
        through: {
          where: {
            accessStatus: 'TEACHER',
          },
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        attributes: ['id', 'feedback_id'],
      },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter((target) => {
    const disabledCourseCodes = target.courseUnit.organisations.flatMap(
      (org) => org.disabledCourseCodes,
    )
    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  const filteredByFeedbacks = filteredFeedbackTargets.filter((target) => {
    const found = target.userFeedbackTargets.find(
      (u) => u.dataValues.feedback_id,
    )
    return !!found
  })

  return filteredByFeedbacks
}

const createRecipientsForFeedbackTargets = async (
  feedbackTargets,
  options = { primaryOnly: false, whereOpenEmailNotSent: false },
) => {
  // Leo if you are reading this you are allowed to refactor :)
  // Too late 😤

  const emails = {}

  feedbackTargets.forEach((feedbackTarget) => {
    feedbackTarget.users
      .filter(
        options.whereOpenEmailNotSent
          ? (u) => !u.UserFeedbackTarget.feedbackOpenEmailSent
          : () => true,
      )
      .forEach((user) => {
        const certainlyNoAdUser = user.username === user.id
        const possiblyNoAdUser =
          feedbackTarget.courseRealisation.isMoocCourse &&
          !user.degreeStudyright

        const sendToBothEmails =
          !options.primaryOnly && (certainlyNoAdUser || possiblyNoAdUser)

        const userEmails = [
          user.email,
          sendToBothEmails ? user.secondaryEmail : false,
        ]
        // for some users, email === secondaryEmail. In that case, use only primary.
        userEmails[1] = userEmails[0] === userEmails[1] ? false : userEmails[1]

        userEmails.filter(Boolean).forEach((email) => {
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

const createRecipientsForSingleFeedbackTarget = async (
  feedbackTarget,
  options,
) => createRecipientsForFeedbackTargets([feedbackTarget[0]], options)

const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getOpenFeedbackTargetsForStudents()

  const studentsWithFeedbackTargets = await createRecipientsForFeedbackTargets(
    feedbackTargets,
    { whereOpenEmailNotSent: true },
  )

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTargets[student],
      ),
  )

  const ids = Object.keys(studentsWithFeedbackTargets).flatMap((key) =>
    studentsWithFeedbackTargets[key].map(
      (course) => course.userFeedbackTargetId,
    ),
  )

  UserFeedbackTarget.update(
    {
      feedbackOpenEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  await pate.send(emailsToBeSent, 'Notify students about feedback opening')

  return emailsToBeSent
}

const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teachersWithFeedbackTargets = await createRecipientsForFeedbackTargets(
    feedbackTargets,
    { primaryOnly: true },
  )

  const emailsToBeSent = Object.keys(teachersWithFeedbackTargets).map(
    (teacher) =>
      emailReminderAboutSurveyOpeningToTeachers(
        teacher,
        teachersWithFeedbackTargets[teacher],
      ),
  )

  const ids = feedbackTargets.map((target) => target.id)

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
    },
  )

  await pate.send(emailsToBeSent, 'Remind teachers about feedback opening')

  return emailsToBeSent
}

const sendEmailToStudentsWhenOpeningImmediately = async (feedbackTargetId) => {
  const feedbackTarget = await getFeedbackTargetOpeningImmediately(
    feedbackTargetId,
  )

  if (!feedbackTarget.length)
    throw new ApplicationError(
      'Students already recieved a feedback open notification',
      400,
    )

  const studentsWithFeedbackTarget =
    await createRecipientsForSingleFeedbackTarget(feedbackTarget, {
      whereOpenEmailNotSent: true,
    })

  const studentEmailsToBeSent = Object.keys(studentsWithFeedbackTarget).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTarget[student],
      ),
  )

  const ids = Object.values(studentsWithFeedbackTarget).map(
    (value) => value.userFeedbackTargetId,
  )

  UserFeedbackTarget.update(
    {
      feedbackOpenEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  await pate.send(
    studentEmailsToBeSent,
    'Notify students about feedback opening immediately',
  )

  return studentEmailsToBeSent
}

/**
 * Automatically remind students 3 days before feedback closes
 * and feedback target has student list visible (SOS-feature)
 */
const sendEmailReminderOnFeedbackToStudents = async () => {
  const feedbackTargets = await sequelize.query(
    `
    SELECT DISTINCT fbt.*
    FROM feedback_targets as fbt

    INNER JOIN course_units as cu ON cu.id = fbt.course_unit_id
    INNER JOIN course_units_organisations as cuo ON cu.id = cuo.course_unit_id
    INNER JOIN organisations as org ON org.id = cuo.organisation_id

    WHERE cu.course_code = ANY (org.student_list_visible_course_codes)
    AND fbt.closes_at > NOW() + interval '0 days'
    AND fbt.closes_at < NOW() + interval '30 days'
    AND (
      fbt.feedback_reminder_last_sent_at IS NULL
      OR fbt.feedback_reminder_last_sent_at < NOW() - interval '24 hours'
    )
  `,
    {
      model: FeedbackTarget,
      mapToModel: true,
    },
  )

  logger.info(
    `[Pate] Sending automatic reminder for ${feedbackTargets.length} feedback targets`,
  )

  await Promise.all(
    feedbackTargets.map((fbt) => fbt.sendFeedbackReminderToStudents('')),
  )
}

const sendFeedbackSummaryReminderToStudents = async (
  feedbackTarget,
  feedbackResponse,
) => {
  const courseUnit = await feedbackTarget.getCourseUnit()
  const cr = await feedbackTarget.getCourseRealisation()
  const students = await feedbackTarget.getStudentsForFeedbackTarget()
  const url = `https://coursefeedback.helsinki.fi/targets/${feedbackTarget.id}/results`
  const formattedStudents = students
    .filter((student) => student.email)
    .map((student) => ({
      email: student.email,
      language: student.language || 'en',
    }))
  return sendNotificationAboutFeedbackResponseToStudents(
    url,
    formattedStudents,
    courseUnit.name,
    cr.startDate,
    cr.endDate,
    feedbackResponse,
  )
}

module.exports = {
  getOpenFeedbackTargetsForStudents,
  getFeedbackTargetsAboutToOpenForTeachers,
  getFeedbackTargetsWithoutResponseForTeachers,
  createRecipientsForFeedbackTargets,
  notificationAboutSurveyOpeningToStudents,
  emailReminderAboutSurveyOpeningToTeachers,
  emailReminderAboutFeedbackResponseToTeachers,

  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailToStudentsWhenOpeningImmediately,
  sendEmailReminderOnFeedbackToStudents,
  sendFeedbackSummaryReminderToStudents,
}
