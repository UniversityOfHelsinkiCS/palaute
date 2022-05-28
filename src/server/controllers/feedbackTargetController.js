const _ = require('lodash')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

const { ApplicationError } = require('../util/customErrors')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
  Feedback,
  Survey,
  Question,
  User,
  Organisation,
} = require('../models')

const { sequelize } = require('../util/dbConnection')
const logger = require('../util/logger')
const {
  sendEmailToStudentsWhenOpeningImmediately,
} = require('../util/emailSender')
const { JWT_KEY } = require('../util/config')

const mapStatusToValue = {
  STUDENT: 1,
  TEACHER: 2,
}

// TODO refactor
const handleListOfUpdatedQuestionsAndReturnIds = async (questions) => {
  const updatedQuestionIdsList = []

  /* eslint-disable */
  for (const question of questions) {
    let updatedQuestion
    if (question.id) {
      const [_, updatedQuestions] = await Question.update(
        {
          ...question,
        },
        { where: { id: question.id }, returning: true },
      )
      updatedQuestion = updatedQuestions[0]
    } else {
      updatedQuestion = await Question.create({
        ...question,
      })
    }

    updatedQuestionIdsList.push(updatedQuestion.id)
  }
  /* eslint-enable */

  return updatedQuestionIdsList
}

const asyncFeedbackTargetsToJSON = async (
  feedbackTargets,
  isAdmin = false,
  includeSurveys = true,
) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject(includeSurveys)

    const sortedUserFeedbackTargets = feedbackTarget.userFeedbackTargets.sort(
      (a, b) =>
        mapStatusToValue[b.accessStatus] - mapStatusToValue[a.accessStatus],
      // this is intentionally b - a, because we want the max value first
    )

    const relevantUserFeedbackTarget = sortedUserFeedbackTargets[0]

    return {
      ...publicTarget,
      accessStatus: relevantUserFeedbackTarget?.accessStatus ?? 'NONE',
      feedback: relevantUserFeedbackTarget?.feedback ?? null,
    }
  }

  const convertedFeedbackTargets = []

  /* eslint-disable */
  for (const feedbackTarget of feedbackTargets) {
    if (feedbackTarget) {
      convertedFeedbackTargets.push(await convertSingle(feedbackTarget))
    }
  }

  if (isAdmin) {
    const fbtTeachers = await Promise.all(
      feedbackTargets.map(
        async (feedbackTarget) =>
          await feedbackTarget.getTeachersForFeedbackTarget(),
      ),
    )
    convertedFeedbackTargets.map((fbt, i) => ({
      ...fbt,
      responsibleTeachers: fbtTeachers[i],
    }))
  }
  /* eslint-enable */

  return convertedFeedbackTargets
}

const convertFeedbackTargetForAdmin = async (feedbackTargets, isAdmin) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject()
    const responsibleTeachers = isAdmin
      ? await feedbackTarget.getTeachersForFeedbackTarget()
      : null

    return {
      ...publicTarget,
      accessStatus: isAdmin ? 'TEACHER' : 'NONE',
      feedback: null,
      responsibleTeachers,
    }
  }

  if (!Array.isArray(feedbackTargets)) return convertSingle(feedbackTargets)

  const responseReady = []

  /* eslint-disable */
  for (const feedbackTarget of feedbackTargets) {
    if (feedbackTarget) {
      responseReady.push(await convertSingle(feedbackTarget))
    }
  }
  /* eslint-enable */

  return responseReady
}

const getIncludes = (userId, accessStatus) => {
  // where parameter cant have undefined values
  const where = accessStatus ? { userId, accessStatus } : { userId }
  return [
    {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      required: true,
      where,
      include: { model: Feedback, as: 'feedback' },
    },
    {
      model: CourseUnit,
      as: 'courseUnit',
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          through: { attributes: ['type'], as: 'courseUnitOrganisation' },
          required: true,
        },
      ],
    },
    { model: CourseRealisation, as: 'courseRealisation' },
  ]
}

const getFeedbackCount = async (req, res) => {
  const feedbackTargetId = Number(req?.params?.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackCount = await sequelize.query(
    `
    SELECT COUNT(user_feedback_targets.feedback_id) AS feedback_count
    FROM user_feedback_targets, feedback_targets
    WHERE user_feedback_targets.feedback_target_id = feedback_targets.id
    
    AND feedback_targets.course_unit_id IN (
      SELECT cu.id as ids
      FROM course_units as cu, feedback_targets as fbt 
      WHERE fbt.id = :feedbackTargetId
    
      AND cu.course_code IN (
        SELECT course_code FROM course_units WHERE id = fbt.course_unit_id
      )
    )
    AND user_feedback_targets.access_status = 'STUDENT';
  `,
    { replacements: { feedbackTargetId } },
  )
  if (feedbackCount.length < 1 || feedbackCount[0] < 1) {
    res.send({ feedbackCount: 0 })
  }

  res.send({ feedbackCount: Number(feedbackCount[0][0].feedback_count) })
}

const getFeedbackTargetByOrganisationAccess = async (
  feedbackTargetId,
  user,
) => {
  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
        ],
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })
  if (!feedbackTarget)
    throw new ApplicationError(
      `Feedback target with id ${feedbackTargetId} not found`,
      404,
    )

  feedbackTarget.userFeedbackTargets = []
  const organisationAccess = await user.getOrganisationAccessByCourseUnitId(
    feedbackTarget.courseUnitId,
  )
  if (organisationAccess?.read) {
    return feedbackTarget
  }
  return null
}

const getFeedbackTargetByIdForUser = async (feedbackTargetId, user) => {
  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    include: getIncludes(user.id),
  })
  if (!feedbackTarget) {
    return getFeedbackTargetByOrganisationAccess(feedbackTargetId, user)
  }

  return feedbackTarget
}

const getFeedbackTargetsForStudent = async (userId) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      hidden: false,
    },
    include: getIncludes(userId, 'STUDENT'),
  })
  return feedbackTargets
}

const getStudentListVisibility = async (courseUnitId) => {
  const organisationRows = await sequelize.query(
    'SELECT O.* from organisations O, course_units_organisations C ' +
      " WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id AND c.type = 'PRIMARY'",
    {
      replacements: {
        cuId: courseUnitId,
      },
    },
  )

  if (organisationRows.length === 0) {
    logger.error('NO PRIMARY ORGANISATION FOR COURSE', { courseUnitId })
    return false
  }

  if (!organisationRows[0].length) return false

  const { student_list_visible: studentListVisible } = organisationRows[0][0]

  return studentListVisible ?? false
}

const getOneForAdmin = async (req, res, feedbackTargetId) => {
  const adminFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId, {
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
        ],
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })
  if (!adminFeedbackTarget)
    throw new ApplicationError('Feedback target not found', 404)

  const responseReady = await convertFeedbackTargetForAdmin(
    adminFeedbackTarget,
    req.isAdmin,
  )

  const studentListVisible = adminFeedbackTarget?.courseUnit
    ? await getStudentListVisibility(adminFeedbackTarget.courseUnit.id)
    : false

  return res.send({ ...responseReady, studentListVisible })
}

const getOne = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  if (req.isAdmin) {
    return getOneForAdmin(req, res, feedbackTargetId)
  }

  const feedbackTarget = await getFeedbackTargetByIdForUser(
    feedbackTargetId,
    req.user,
  )

  if (!feedbackTarget) {
    throw new ApplicationError('Feedback target not found for user', 403)
  }

  const studentListVisible = feedbackTarget?.courseUnit
    ? await getStudentListVisibility(feedbackTarget.courseUnit.id)
    : false

  const responseReady = await asyncFeedbackTargetsToJSON(
    [feedbackTarget],
    req.isAdmin,
  )

  return res.send({
    ...responseReady[0],
    studentListVisible,
  })
}

const update = async (req, res) => {
  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackTarget = req.isAdmin
    ? await FeedbackTarget.findByPk(feedbackTargetId)
    : await getFeedbackTargetByIdForUser(feedbackTargetId, req.user)

  if (
    !req.isAdmin &&
    feedbackTarget?.userFeedbackTargets[0]?.accessStatus !== 'TEACHER'
  )
    throw new ApplicationError('Forbidden', 403)

  const updates = _.pick(req.body, [
    'name',
    'hidden',
    'opensAt',
    'closesAt',
    'publicQuestionIds',
    'feedbackVisibility',
  ])

  const { questions, surveyId } = req.body

  if (updates.opensAt || updates.closesAt) {
    feedbackTarget.feedbackDatesEditedByTeacher = true
  }

  Object.assign(feedbackTarget, updates)

  if (questions && surveyId) {
    const survey = await Survey.findOne({
      where: {
        id: surveyId,
        feedbackTargetId: feedbackTarget.id,
      },
    })
    if (!survey) throw new ApplicationError('Not found', 404)
    survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(
      questions,
    )

    await survey.save()
  }

  await feedbackTarget.save()

  res.sendStatus(200)
}

const getForStudent = async (req, res) => {
  const userId = req.user?.id
  const feedbackTargets = await getFeedbackTargetsForStudent(userId)

  const filteredFeedbackTargets = feedbackTargets.filter(
    ({ courseUnit }) =>
      courseUnit &&
      !courseUnit.organisations.some(({ disabledCourseCodes }) =>
        disabledCourseCodes.includes(courseUnit.courseCode),
      ),
  )

  const responseReady = await asyncFeedbackTargetsToJSON(
    filteredFeedbackTargets,
    false,
    false,
  )

  res.send(responseReady)
}

const getTargetsByCourseUnit = async (req, res) => {
  const courseCode = req.params.id

  const {
    courseRealisationStartDateAfter,
    courseRealisationStartDateBefore,
    courseRealisationEndDateAfter,
    courseRealisationEndDateBefore,
    feedbackType,
    includeSurveys,
  } = req.query

  const courseRealisationWhere = {
    [Op.and]: [
      courseRealisationStartDateAfter && {
        startDate: {
          [Op.gt]: new Date(courseRealisationStartDateAfter),
        },
      },
      courseRealisationStartDateBefore && {
        startDate: {
          [Op.lt]: new Date(courseRealisationStartDateBefore),
        },
      },
      courseRealisationEndDateAfter && {
        endDate: {
          [Op.gt]: new Date(courseRealisationEndDateAfter),
        },
      },
      courseRealisationEndDateBefore && {
        endDate: {
          [Op.lt]: new Date(courseRealisationEndDateBefore),
        },
      },
    ].filter(Boolean),
  }

  const targetWhere = {
    [Op.and]: [
      feedbackType && {
        feedbackType,
      },
    ].filter(Boolean),
  }

  const feedbackTargets = await FeedbackTarget.findAll({
    where: targetWhere,
    order: [
      [
        { model: CourseRealisation, as: 'courseRealisation' },
        'startDate',
        'DESC',
      ],
    ],
    attributes: [
      'id',
      'name',
      'feedbackResponse',
      'courseUnitId',
      'courseRealisationId',
      'feedbackType',
      'opensAt',
      'closesAt',
    ],
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          userId: req.user.id,
          accessStatus: 'TEACHER',
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        where: {
          courseCode,
        },
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: { ...courseRealisationWhere },
      },
    ],
  })

  if (feedbackTargets.length === 0) {
    return res.send([])
  }

  const counts = await sequelize.query(
    `
    SELECT feedback_target_id, COUNT(*) AS enrolled_count, COUNT(feedback_id) AS feedback_count
    FROM user_feedback_targets
    WHERE feedback_target_id IN (:feedbackTargetIds) AND access_status = 'STUDENT'
    GROUP BY (feedback_target_id)
  `,
    {
      replacements: {
        feedbackTargetIds: feedbackTargets.map(({ id }) => id),
      },
      type: sequelize.QueryTypes.SELECT,
    },
  )

  const studentListVisible = await getStudentListVisibility(
    feedbackTargets[0].courseUnitId,
  )

  if (includeSurveys === 'true') {
    // eslint-disable-next-line
    for (const target of feedbackTargets) {
      // eslint-disable-next-line no-await-in-loop
      await target.populateSurveys()
    }
  }

  const formattedFeedbackTargets = feedbackTargets.map((target) => {
    const targetCounts = counts.find(
      (row) => parseInt(row.feedback_target_id, 10) === target.id,
    )

    return {
      ..._.pick(target.toJSON(), [
        'id',
        'name',
        'opensAt',
        'closesAt',
        'feedbackType',
        'courseRealisation',
        'courseUnit',
        'feedbackResponse',
        'questions',
        'surveys',
      ]),
      feedbackCount: parseInt(targetCounts?.feedback_count ?? 0, 10),
      enrolledCount: parseInt(targetCounts?.enrolled_count ?? 0, 10),
      feedbackResponseGiven: !!target.get('feedbackResponse'),
      studentListVisible,
    }
  })

  return res.send(formattedFeedbackTargets)
}

const getFeedbacks = async (req, res) => {
  const { user, isAdmin } = req
  const feedbackTargetId = Number(req.params.id)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  const feedbackTarget = userFeedbackTarget
    ? userFeedbackTarget.feedbackTarget
    : await FeedbackTarget.findByPk(feedbackTargetId)

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  const courseUnit = await CourseUnit.findOne({
    where: {
      id: feedbackTarget.courseUnitId,
    },
  })

  const userOrganisationAccess = await user.getOrganisationAccessByCourseUnitId(
    courseUnit.id,
  )

  const userHasOrganisationAccess = Boolean(userOrganisationAccess)
  const isTeacher = userFeedbackTarget?.accessStatus === 'TEACHER'

  // Teacher can see feedback any time
  // Admin can see feedback any time
  // Hallinto people can see feedback any time
  // Outsider, not in the course should only be shown if feedback is public to all
  if (
    !isAdmin &&
    !userHasOrganisationAccess &&
    !isTeacher &&
    !userFeedbackTarget &&
    feedbackTarget.feedbackVisibility !== 'ALL'
  ) {
    return res.send({
      feedbacks: [],
      feedbackVisible: false,
      userOrganisationAccess,
    })
  }

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
    include: {
      model: Feedback,
      required: true,
      as: 'feedback',
    },
  })

  const feedbacks = studentFeedbackTargets.map((t) => t.feedback)

  const accessStatus = userFeedbackTarget?.accessStatus ?? 'STUDENT'

  const publicFeedbacks = await feedbackTarget.getPublicFeedbacks(feedbacks, {
    accessStatus,
    isAdmin,
    userOrganisationAccess,
  })

  return res.send({
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    userOrganisationAccess,
  })
}

const getStudentsWithFeedback = async (req, res) => {
  const { user, isAdmin } = req
  const feedbackTargetId = Number(req.params.id)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  if (!isAdmin && !userFeedbackTarget?.hasTeacherAccess()) {
    throw new ApplicationError(
      'User is not authorized to view students with feedback',
      403,
    )
  }

  if (!userFeedbackTarget?.feedbackTarget) {
    return res.send([])
  }

  const studentListVisible = await getStudentListVisibility(
    userFeedbackTarget.feedbackTarget.courseUnitId,
  )

  if (!studentListVisible) {
    return res.send([])
  }

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
    include: [
      {
        model: User,
        as: 'user',
      },
      {
        model: Feedback,
        as: 'feedback',
        required: true,
      },
    ],
  })

  if (studentFeedbackTargets.length < 5) {
    return res.send([])
  }

  const users = studentFeedbackTargets.map((target) => target.user)

  return res.send(users)
}

const updateFeedbackResponse = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const { user, isAdmin } = req
  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  if (!isAdmin && !userFeedbackTarget?.hasTeacherAccess()) {
    throw new ApplicationError('User is not authorized to respond', 403)
  }

  if (userFeedbackTarget.feedbackResponseEmailSent) {
    throw new ApplicationError(
      'Feedback response email has already been sent',
      400,
    )
  }

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  feedbackTarget.feedbackResponse = req.body.data
  await feedbackTarget.save()
  res.sendStatus(200)
}

const emailStudentsAboutResponse = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)
  const feedbackTargetsUserIsTeacherTo =
    await req.user.feedbackTargetsHasTeacherAccessTo()

  const relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(
    (target) => target.id === feedbackTargetId,
  )

  if (!relevantFeedbackTarget)
    throw new ApplicationError(
      `No feedback target found with id ${feedbackTargetId} for user`,
      404,
    )

  if (relevantFeedbackTarget.feedbackResponseEmailSent)
    throw new ApplicationError(
      'Feedback response email has already been sent',
      400,
    ) // or 409 ?

  const { feedbackResponse } = req.body.data

  relevantFeedbackTarget.feedbackResponseEmailSent = true
  const emailsSentTo =
    await relevantFeedbackTarget.sendFeedbackSummaryReminderToStudents(
      feedbackResponse,
    )
  await relevantFeedbackTarget.save()

  res.send(emailsSentTo)
}

const remindStudentsOnFeedback = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const feedbackTargetsUserIsTeacherTo =
    await req.user.feedbackTargetsHasTeacherAccessTo()

  const relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(
    (target) => target.id === feedbackTargetId,
  )

  if (!relevantFeedbackTarget)
    throw new ApplicationError(
      `No feedback target found with id ${feedbackTargetId} for user`,
      404,
    )
  if (relevantFeedbackTarget.feedbackReminderEmailToStudentsSent)
    throw new ApplicationError('Email reminder has already been sent', 400) // or 409 ?

  const { reminder } = req.body.data

  relevantFeedbackTarget.feedbackReminderEmailToStudentsSent = true

  await relevantFeedbackTarget.sendFeedbackReminderToStudents(reminder)
  await relevantFeedbackTarget.save()

  res.sendStatus(200)
}

const openFeedbackImmediately = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { user, isAdmin } = req
  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  if (!isAdmin && !userFeedbackTarget?.hasTeacherAccess()) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  if (req.body.opensAt <= feedbackTarget.closesAt) {
    throw new ApplicationError(
      'Survey can not open after its closing date',
      400,
    )
  }

  if (!feedbackTarget.feedbackOpeningReminderEmailSent) {
    sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)
  }

  feedbackTarget.opensAt = req.body.opensAt
  feedbackTarget.feedbackDatesEditedByTeacher = true
  feedbackTarget.feedbackOpeningReminderEmailSent = true

  await feedbackTarget.save()

  res.sendStatus(200)
}

const closeFeedbackImmediately = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { user, isAdmin } = req

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  if (!isAdmin && !userFeedbackTarget?.hasTeacherAccess()) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  if (req.body.closesAt < feedbackTarget.opensAt) {
    throw new ApplicationError('Invalid date for feedback closing', 400)
  }

  feedbackTarget.closesAt = req.body.closesAt
  feedbackTarget.feedbackDatesEditedByTeacher = true
  await feedbackTarget.save()

  res.sendStatus(200)
}

const getUsers = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  const { isAdmin } = req

  if (!isAdmin) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
    },
    include: [
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
  })

  const users = userFeedbackTargets.map(({ user }) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    studentNumber: user.studentNumber,
    token: jwt.sign({ username: user.username }, JWT_KEY),
  }))

  res.send(users)
}

const deleteUserFeedbackTarget = async (req, res) => {
  const { isAdmin } = req

  if (!isAdmin) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const feedbackTargetId = Number(req.params.id)
  const { userId } = req.params

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackTargetId,
      userId,
    },
  })

  if (!userFeedbackTarget) {
    throw new ApplicationError('User feedback target is not found', 404)
  }

  await userFeedbackTarget.destroy()

  res.sendStatus(200)
}

module.exports = {
  getForStudent,
  getTargetsByCourseUnit,
  getOne,
  update,
  getFeedbacks,
  getStudentsWithFeedback,
  updateFeedbackResponse,
  emailStudentsAboutResponse,
  openFeedbackImmediately,
  closeFeedbackImmediately,
  remindStudentsOnFeedback,
  getUsers,
  deleteUserFeedbackTarget,
  getFeedbackCount,
}
