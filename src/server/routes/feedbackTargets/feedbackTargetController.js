const _ = require('lodash')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const {
  differenceInMonths,
  addMonths,
  getYear,
  subDays,
  getDate,
  compareAsc,
} = require('date-fns')

const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')

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
  FeedbackTargetLog,
} = require('../../models')

const { sequelize } = require('../../util/dbConnection')
const logger = require('../../util/logger')
const {
  createFeedbackTargetSurveyLog,
  createFeedbackTargetLog,
} = require('../../util/auditLog')
const { mailer } = require('../../mailer')
const {
  JWT_KEY,
  STUDENT_LIST_BY_COURSE_ENABLED,
  STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN,
} = require('../../util/config')

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
  includeTeachers = true,
  includeSurveys = true,
) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject(
      includeSurveys || includeTeachers,
    )

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

  return convertedFeedbackTargets
}

const convertFeedbackTargetForAdmin = async (feedbackTargets) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject(true)

    return {
      ...publicTarget,
      accessStatus: 'TEACHER',
      feedback: null,
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
    SELECT SUM(feedback_count) as "feedbackCount"
    FROM feedback_targets
    WHERE feedback_targets.course_unit_id IN (
      SELECT cu.id as ids
      FROM course_units as cu, feedback_targets as fbt 
      WHERE fbt.id = :feedbackTargetId
    
      AND cu.course_code IN (
        SELECT course_code FROM course_units WHERE id = fbt.course_unit_id
      )
    );
  `,
    { replacements: { feedbackTargetId } },
  )

  if (feedbackCount.length < 1 || feedbackCount[0] < 1) {
    return res.send({ feedbackCount: 0 })
  }

  return res.send({ feedbackCount: Number(feedbackCount[0][0].feedbackCount) })
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

const getStudentListVisibility = async (courseUnitId, isAdmin) => {
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

  const {
    code,
    student_list_visible: studentListVisible,
    student_list_visible_course_codes: studentListVisibleCourseCodes,
  } = organisationRows[0][0]

  if (
    STUDENT_LIST_BY_COURSE_ENABLED.includes(code) ||
    (STUDENT_LIST_BY_COURSE_ENABLED_FOR_ADMIN.includes(code) && isAdmin)
  ) {
    const { courseCode } = await CourseUnit.findByPk(courseUnitId, {
      attributes: ['courseCode'],
    })

    if (studentListVisibleCourseCodes.includes(courseCode)) return true
  }

  return studentListVisible ?? false
}

const getFeedbackTargetsForOrganisations = async (req, res) => {
  const { code } = req.params
  const { startDate, endDate } = req.query
  if (!code) throw new ApplicationError('Missing code', 400)
  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : addMonths(start, 12)

  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: [
      'id',
      'name',
      'feedbackCount',
      'opensAt',
      'closesAt',
      'feedbackResponseEmailSent',
    ],
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        attributes: [
          'id',
          'name',
          'startDate',
          'endDate',
          'isMoocCourse',
          'teachingLanguages',
        ],
        required: true,
        include: {
          model: Organisation,
          as: 'organisations',
          attributes: [],
          required: true,
          where: {
            code,
          },
        },
        where: {
          startDate: {
            [Op.gte]: start,
          },
          endDate: {
            [Op.lte]: end,
          },
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        attributes: ['id', 'name', 'courseCode'],
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        attributes: ['accessStatus'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      },
    ],
  })

  const feedbackTargetsWithUniqueCurs = _.uniqBy(
    feedbackTargets,
    (fbt) => fbt.dataValues.courseRealisation.id,
  )

  const feedbackTargetsWithStudentCounts = feedbackTargetsWithUniqueCurs
    .map((fbt) => fbt.toJSON())
    .map((fbt) => {
      const studentCount = _.sumBy(fbt.userFeedbackTargets, (ufbt) =>
        ufbt.accessStatus === 'STUDENT' ? 1 : 0,
      )
      const teachers = fbt.userFeedbackTargets
        .filter((ufbt) => ufbt.accessStatus === 'TEACHER')
        .map((ufbt) => ufbt.user)

      delete fbt.userFeedbackTargets
      return {
        ...fbt,
        startDate: fbt.courseRealisation.startDate,
        studentCount,
        teachers,
      }
    })

  const dateGrouped = Object.entries(
    _.groupBy(feedbackTargetsWithStudentCounts, (fbt) => fbt.startDate),
  ).sort(([a], [b]) => compareAsc(Date.parse(a), Date.parse(b)))

  const monthGrouped = Object.entries(
    _.groupBy(dateGrouped, ([date]) => {
      const d = Date.parse(date)
      return subDays(d, getDate(d) - 1) // first day of month
    }),
  ).sort(([a], [b]) => compareAsc(Date.parse(a), Date.parse(b)))

  const yearGrouped = Object.entries(
    _.groupBy(monthGrouped, ([date]) => getYear(Date.parse(date))),
  ).sort(([a], [b]) => a.localeCompare(b))

  return res.send(yearGrouped)
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

  const responseReady = await convertFeedbackTargetForAdmin(adminFeedbackTarget)

  const studentListVisible = adminFeedbackTarget?.courseUnit
    ? await getStudentListVisibility(
        adminFeedbackTarget.courseUnit.id,
        req.isAdmin,
      )
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
    true,
    true,
  )

  return res.send({
    ...responseReady[0],
    studentListVisible,
  })
}

const update = async (req, res) => {
  const { isAdmin, user } = req

  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackTarget = isAdmin
    ? await FeedbackTarget.findByPk(feedbackTargetId, {
        include: { model: UserFeedbackTarget, as: 'userFeedbackTargets' },
      })
    : await getFeedbackTargetByIdForUser(feedbackTargetId, req.user)

  const isTeacher =
    feedbackTarget?.userFeedbackTargets[0]?.accessStatus === 'TEACHER'

  const isOrganisationAdmin = (
    await user.getOrganisationAccessByCourseUnitId(feedbackTarget.courseUnitId)
  )?.admin

  if (!isAdmin && !isTeacher && !isOrganisationAdmin)
    throw new ApplicationError('Forbidden', 403)

  const updates = _.pick(req.body, [
    'name',
    'hidden',
    'opensAt',
    'closesAt',
    'publicQuestionIds',
    'feedbackVisibility',
    'continuousFeedbackEnabled',
  ])

  const { questions, surveyId } = req.body

  if (updates.opensAt || updates.closesAt) {
    feedbackTarget.feedbackDatesEditedByTeacher = true
  }

  await createFeedbackTargetLog(feedbackTarget, updates, user)

  Object.assign(feedbackTarget, updates)

  if (questions && surveyId) {
    const survey = await Survey.findOne({
      where: {
        id: surveyId,
        feedbackTargetId: feedbackTarget.id,
      },
    })
    if (!survey) throw new ApplicationError('Not found', 404)
    await createFeedbackTargetSurveyLog(surveyId, questions, user)
    survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(
      questions,
    )

    await survey.save()
  }

  await feedbackTarget.save()

  return res.sendStatus(200)
}

const updateSettingsReadByTeacher = async (req, res) => {
  const { user } = req

  const feedbackTargetId = Number(req.params?.id)

  if (!feedbackTargetId) throw new ApplicationError('Missing id', 400)

  const feedbackTarget = await getFeedbackTargetByIdForUser(
    feedbackTargetId,
    user,
  )

  if (feedbackTarget?.userFeedbackTargets[0]?.accessStatus !== 'TEACHER')
    throw new ApplicationError('Forbidden', 403)

  feedbackTarget.settingsReadByTeacher = true
  await feedbackTarget.save()

  return res.send({ settingsReadByTeacher: true })
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

  const publicFeedbackTargets = await asyncFeedbackTargetsToJSON(
    filteredFeedbackTargets,
    false,
    false,
  )

  const now = Date.now()
  const response = {
    waiting: publicFeedbackTargets.filter(
      (fbt) =>
        Date.parse(fbt.opensAt) < now &&
        Date.parse(fbt.closesAt) > now &&
        !fbt.feedback,
    ),
    given: publicFeedbackTargets.filter((fbt) => fbt.feedback),
    ended: publicFeedbackTargets.filter(
      (fbt) => Date.parse(fbt.closesAt) < now,
    ),
    ongoing: publicFeedbackTargets.filter(
      (fbt) => Date.parse(fbt.opensAt) > now,
    ),
  }

  return res.send(response)
}

const getTargetsForCourseUnit = async (req, res) => {
  const courseCode = req.params.code

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
      'feedbackResponseEmailSent',
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
    req.isAdmin,
  )

  if (includeSurveys === 'true') {
    // eslint-disable-next-line
    for (const target of feedbackTargets) {
      // eslint-disable-next-line no-await-in-loop
      await target.populateSurveys()
    }
  }

  const formattedFeedbackTargets = feedbackTargets
    .map((target) => {
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
        feedbackResponseGiven: target.feedbackResponse?.length > 3,
        feedbackResponseSent: target.feedbackResponseEmailSent,
        studentListVisible,
      }
    })
    .filter(
      (fbt) =>
        fbt.feedbackCount > 0 ||
        Date.parse(fbt.courseRealisation.endDate) > new Date('2021-09-01'),
    )

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

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)
  if (!isAdmin) {
    const userFeedbackTarget = await UserFeedbackTarget.findOne({
      where: {
        userId: user.id,
        feedbackTargetId,
      },
    })

    if (
      !userFeedbackTarget?.hasTeacherAccess() &&
      !(await user.getOrganisationAccessByCourseUnitId(
        feedbackTarget?.courseUnitId,
      ))
    ) {
      throw new ApplicationError(
        'User is not authorized to view students with feedback',
        403,
      )
    }
  }

  if (!feedbackTarget) {
    return res.send([])
  }

  const studentListVisible = await getStudentListVisibility(
    feedbackTarget.courseUnitId,
    isAdmin,
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
      },
    ],
  })

  if (studentFeedbackTargets.length < 5) {
    return res.send([])
  }

  const users = studentFeedbackTargets.map((target) => ({
    ...target.user.dataValues,
    feedbackGiven: Boolean(target.feedback),
  }))

  return res.send(users)
}

const updateFeedbackResponse = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  let relevantFeedbackTarget
  if (req.isAdmin) {
    relevantFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)
  } else {
    const feedbackTargetsUserIsTeacherTo =
      await req.user.feedbackTargetsHasTeacherAccessTo()

    relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(
      (target) => target.id === feedbackTargetId,
    )
  }

  if (!relevantFeedbackTarget)
    throw new ApplicationError(
      `No feedback target found with id ${feedbackTargetId} for user`,
      404,
    )

  const { feedbackResponse, feedbackResponseEmailSent } = req.body.data

  if (
    feedbackResponseEmailSent &&
    relevantFeedbackTarget.feedbackResponseEmailSent
  )
    throw new ApplicationError(
      'Counter feedback email has already been sent',
      400,
    ) // or 409 ?

  if (
    differenceInMonths(
      Date.now(),
      Date.parse(relevantFeedbackTarget.closesAt),
    ) > 6
  ) {
    throw new ApplicationError(
      'Cannot send counter feedback because feedback closed over 6 months ago',
      403,
    )
  }

  relevantFeedbackTarget.feedbackResponse = feedbackResponse
  relevantFeedbackTarget.feedbackResponseEmailSent =
    Boolean(feedbackResponseEmailSent) ||
    relevantFeedbackTarget.feedbackResponseEmailSent

  if (feedbackResponseEmailSent) {
    await mailer.sendFeedbackSummaryReminderToStudents(
      relevantFeedbackTarget,
      feedbackResponse,
    )
  }
  await relevantFeedbackTarget.save()

  return res.send(relevantFeedbackTarget.toJSON())
}

const remindStudentsOnFeedback = async (req, res) => {
  const feedbackTargetId = Number(req.params.id)

  let relevantFeedbackTarget
  if (req.isAdmin) {
    relevantFeedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)
  } else {
    const feedbackTargetsUserIsTeacherTo =
      await req.user.feedbackTargetsHasTeacherAccessTo()

    relevantFeedbackTarget = feedbackTargetsUserIsTeacherTo.find(
      (target) => target.id === feedbackTargetId,
    )
  }

  if (!relevantFeedbackTarget)
    throw new ApplicationError(
      `No feedback target found with id ${feedbackTargetId} for user`,
      404,
    )

  const { data: reminder } = req.body.data

  await mailer.sendFeedbackReminderToStudents(relevantFeedbackTarget, reminder)

  return res.send({
    feedbackReminderLastSentAt:
      relevantFeedbackTarget.feedbackReminderLastSentAt,
  })
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
    await mailer.sendEmailToStudentsWhenOpeningImmediately(feedbackTargetId)
  }

  feedbackTarget.opensAt = req.body.opensAt
  feedbackTarget.feedbackDatesEditedByTeacher = true
  feedbackTarget.feedbackOpeningReminderEmailSent = true

  await createFeedbackTargetLog(feedbackTarget, { openImmediately: true }, user)

  await feedbackTarget.save()

  return res.sendStatus(200)
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

  return res.send(users)
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

  return res.sendStatus(200)
}

const getLogs = async (req, res) => {
  const { isAdmin } = req
  const feedbackTargetId = req.params.id

  if (!isAdmin) {
    throw new ApplicationError('User is not authorized', 403)
  }

  const { feedbackTargetLogs } = await FeedbackTarget.findByPk(
    feedbackTargetId,
    {
      attributes: [],
      order: [
        [
          { model: FeedbackTargetLog, as: 'feedbackTargetLogs' },
          'createdAt',
          'DESC',
        ],
      ],
      include: {
        model: FeedbackTargetLog,
        as: 'feedbackTargetLogs',
        attributes: ['data', 'createdAt'],
        include: {
          model: User,
          as: 'user',
        },
      },
    },
  )

  return res.send(feedbackTargetLogs)
}

const getFeedbackTargetsForCourseRealisation = async (req, res) => {
  const { user, isAdmin } = req
  const { id } = req.params

  if (isAdmin) {
    const feedbackTargets = await FeedbackTarget.findAll({
      where: {
        courseRealisationId: id,
      },
    })

    return res.send(feedbackTargets)
  }

  const userTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        where: {
          courseRealisationId: id,
        },
      },
    ],
  })

  const targets = userTargets.map(({ feedbackTarget }) => feedbackTarget)

  return res.send(targets)
}

const adRouter = Router()

// @TODO Maybe refactor these 4 routes to use query params, eg. GET /targets?course-unit=TKT1001
adRouter.get('/for-student', getForStudent)
adRouter.get('/for-course-unit/:code', getTargetsForCourseUnit)
adRouter.get(
  '/for-course-realisation/:id',
  getFeedbackTargetsForCourseRealisation,
)
adRouter.get('/for-organisation/:code', getFeedbackTargetsForOrganisations)

adRouter.get('/:id', getOne)
adRouter.put('/:id', update)
adRouter.put('/:id/read-settings', updateSettingsReadByTeacher)
adRouter.get('/:id/feedbacks', getFeedbacks)
adRouter.get('/:id/users', getUsers)
adRouter.get('/:id/feedback-count', getFeedbackCount)
adRouter.get('/:id/logs', getLogs)
adRouter.put('/:id/response', updateFeedbackResponse)
adRouter.put('/:id/remind-students', remindStudentsOnFeedback)
adRouter.get('/:id/students-with-feedback', getStudentsWithFeedback)
adRouter.put('/:id/open-immediately', openFeedbackImmediately)
adRouter.delete('/:id/user-feedback-targets/:userId', deleteUserFeedbackTarget)

const noadRouter = Router()

noadRouter.get('/:id', getOne)
noadRouter.get('/:id/feedbacks', getFeedbacks)

module.exports = {
  adRouter,
  noadRouter,
}
