const { Op } = require('sequelize')
const { addDays, subDays } = require('date-fns')
const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  User,
} = require('../models')

const {
  notificationAboutSurveyOpeningToStudents,
  emailReminderAboutSurveyOpeningToTeachers,
  sendEmail,
} = require('./pate')

const courseRealisationIds = [
  'hy-CUR-142374536',
  'hy-opt-cur-2122-581136f4-31c1-477a-8aef-c1bb175853e0',
  'otm-8c6f33a6-c73e-4832-b55d-027f2ff43b73',
  'hy-opt-cur-2122-8d2669fe-1556-441d-935f-eed1b33d1565',
  'hy-opt-cur-2122-e86071fd-26bf-4559-a7f7-602e27b014cb',
  'hy-opt-cur-2122-e7ab534a-582a-4b77-adcd-5fd21d11d161',
  'hy-opt-cur-2122-547b71bd-fc10-4b5d-b0e6-be8906e4a2c1',
  'hy-CUR-143094659',
  'hy-CUR-142659169',
  'hy-CUR-142466466',
  'otm-19a18a9a-6b4a-4414-ad85-71f5a3fda2d4',
  'hy-CUR-142362029',
  'hy-CUR-142484060',
  'hy-CUR-142207739',
  'hy-opt-cur-2122-db7d3dc0-b099-4249-823b-ca553de6ee5d',
  'hy-CUR-141303998',
  'hy-opt-cur-2122-01db1c77-f9e8-42e7-945a-4e11a7ea2305',
  'hy-opt-cur-2122-43eb83da-edd9-4b27-89c5-75abab91e121',
  'hy-CUR-142861243',
  'hy-CUR-142420965',
  'hy-CUR-142479485',
  'hy-CUR-142473269',
  'hy-opt-cur-2122-1128b41b-24b3-4c2f-b06d-5bbfce3ae164',
  'hy-opt-cur-2122-10eeb4e6-9ee4-46a7-95ec-3ffc7e86b038',
  'hy-CUR-142424158',
  'hy-CUR-142196511',
  'hy-CUR-141693785',
  'hy-opt-cur-2122-bf8633ea-1e42-41ed-b7e9-2b9cc0d6b8f6',
  'hy-CUR-141316593',
  'hy-opt-cur-2122-043b4efc-1704-4215-9277-837fad6a583f28b41b-24b3-4c2f-b06d-5bbfce3ae164',
  'hy-opt-cur-2122-9f78b627-6261-4eb9-91c4-426066b56cef',
  'hy-opt-cur-2122-929c7a13-fce1-4887-8012-71ce93c90535',
  'hy-opt-cur-2122-918bf7c3-6cc2-4ee0-81b7-b8f6bc9e239a',
  'hy-CUR-137780335',
  'hy-opt-cur-2122-81b1f6e5-0e7c-4978-9e8b-31ef5ae4b24b',
  'hy-opt-cur-2122-78f3925d-9f29-4c70-ab6f-9518dbfa85cb',
  'hy-CUR-140552639',
  'hy-opt-cur-2122-1138058b-45ed-46da-b283-34be93eaadd3',
  'hy-CUR-142374536',
  'hy-CUR-142349531',
]

const getFeedbackTargetsForSpecialCase = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      courseRealisationId: {
        [Op.in]: courseRealisationIds,
      },
      closesAt: {
        [Op.gt]: new Date(),
      },
      hidden: false,
      feedbackType: 'courseRealisation',
      feedbackOpenNotificationEmailSent: false,
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
        attributes: ['email', 'language'],
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

    return !disabledCourseCodes.includes(target.courseUnit.courseCode)
  })

  return filteredFeedbackTargets
}

const getOpenFeedbackTargetsForStudents = async () => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      opensAt: {
        [Op.gt]: subDays(new Date(), 1),
        [Op.lt]: addDays(new Date(), 1),
      },
      closesAt: {
        [Op.gt]: new Date(),
      },
      feedbackOpenNotificationEmailSent: false,
      hidden: false,
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: { [Op.gt]: new Date('September 1, 2021 00:00:00') },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode'],
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
        attributes: ['email', 'language'],
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
          startDate: { [Op.gt]: new Date('September 1, 2021 00:00:00') },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        attributes: ['courseCode'],
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
        attributes: ['email', 'language'],
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

const aggregateFeedbackTargets = async (feedbackTargets) => {
  // Leo if you are reading this you are allowed to refactor :)
  /* eslint-disable */

  let emails = {}
  for (feedbackTarget of feedbackTargets) {
    for (user of feedbackTarget.users) {
      if (!user.email) continue
      emails[user.email]
        ? (emails[user.email] = emails[user.email].concat([
            {
              id: feedbackTarget.id,
              name: feedbackTarget.courseUnit.name,
              opensAt: feedbackTarget.opensAt,
              closesAt: feedbackTarget.closesAt,
              language: user.language,
            },
          ]))
        : (emails[user.email] = [
            {
              id: feedbackTarget.id,
              name: feedbackTarget.courseUnit.name,
              opensAt: feedbackTarget.opensAt,
              closesAt: feedbackTarget.closesAt,
              language: user.language,
            },
          ])
    }
  }
  /* eslint-enable */

  return emails
}

const sendEmailAboutSurveyOpeningToStudents = async () => {
  const feedbackTargets = await getOpenFeedbackTargetsForStudents()

  /* eslint-disable */

  const studentsWithFeedbackTargets = await aggregateFeedbackTargets(
    feedbackTargets,
  )

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTargets[student],
      ),
  )
  const ids = feedbackTargets.map((target) => target.id)

  console.log(ids)
//  FeedbackTarget.update(
//    {
//      feedbackOpenNotificationEmailSent: true,
//    },
//    {
//      where: {
//        id: {
//          [Op.in]: ids,
//        },
//      },
//    },
//  )
//
//  sendEmail(emailsToBeSent)

  return emailsToBeSent
}

const sendEmailReminderAboutSurveyOpeningToTeachers = async () => {
  const feedbackTargets = await getFeedbackTargetsAboutToOpenForTeachers()

  const teachersWithFeedbackTargets = await aggregateFeedbackTargets(
    feedbackTargets,
  )

  const emailsToBeSent = Object.keys(teachersWithFeedbackTargets).map(
    (teacher) =>
      emailReminderAboutSurveyOpeningToTeachers(
        teacher,
        teachersWithFeedbackTargets[teacher],
      ),
  )

  /* eslint-enable */
}

const sendEmailForSpecialCase = async () => {
  const feedbackTargets = await getFeedbackTargetsForSpecialCase()

  const studentsWithFeedbackTargets = await aggregateFeedbackTargets(
    feedbackTargets,
  )

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTargets[student],
      ),
  )

  const ids = feedbackTargets.map((target) => target.id)

  FeedbackTarget.update(
    {
      feedbackOpenNotificationEmailSent: true,
    },
    {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    },
  )

  sendEmail(emailsToBeSent)

  return emailsToBeSent
}

const returnEmailsToBeSentToday = async () => {
  const feedbackTargets = await getFeedbackTargetsForSpecialCase()

  const studentsWithFeedbackTargets = await aggregateFeedbackTargets(
    feedbackTargets,
  )

  const emailsToBeSent = Object.keys(studentsWithFeedbackTargets).map(
    (student) =>
      notificationAboutSurveyOpeningToStudents(
        student,
        studentsWithFeedbackTargets[student],
      ),
  )

  return emailsToBeSent
}

sendEmailForSpecialCase()

module.exports = {
  sendEmailAboutSurveyOpeningToStudents,
  sendEmailReminderAboutSurveyOpeningToTeachers,
  sendEmailForSpecialCase,
  returnEmailsToBeSentToday,
}
