const dateFns = require('date-fns')
const _ = require('lodash')
const { Op } = require('sequelize')
const { useOldImporter } = require('../util/config')

const { ApplicationError } = require('../util/customErrors')

const { getEnrolmentByPersonId } = require('../util/importerEnrolled')
const { getResponsibleByPersonId } = require('../util/importerResponsible')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
  Feedback,
  Survey,
  Question,
  User,
  CourseUnitsOrganisation,
} = require('../models')

const { sequelize } = require('../util/dbConnection')

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

const asyncFeedbackTargetsToJSON = async (feedbackTargets) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject()

    const sortedUserFeedbackTargets = feedbackTarget.userFeedbackTargets.sort(
      (a, b) =>
        mapStatusToValue[b.accessStatus] - mapStatusToValue[a.accessStatus],
      // this is intentionally b - a, because we want the max value first
    )

    const relevantUserFeedbackTarget = sortedUserFeedbackTargets[0]
    const { accessStatus, feedback } = relevantUserFeedbackTarget

    return {
      ...publicTarget,
      accessStatus,
      feedback,
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

const convertFeedbackTargetForAdmin = async (feedbackTargets, isAdmin) => {
  const convertSingle = async (feedbackTarget) => {
    const publicTarget = await feedbackTarget.toPublicObject()

    return {
      ...publicTarget,
      accessStatus: isAdmin ? 'TEACHER' : 'NONE',
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
    { model: CourseUnit, as: 'courseUnit' },
    { model: CourseRealisation, as: 'courseRealisation' },
  ]
}

const getFeedbackTargetByIdForUser = async (req) => {
  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id), {
    include: getIncludes(req.user.id),
  })

  // TODO
  /* if (!isAdmin && !feedbackTarget)
    throw new ApplicationError('Not found or you do not have access', 404)

  if (
    !isAdmin &&
    feedbackTarget.hidden &&
    !(feedbackTarget.userFeedbackTargets[0]?.accessStatus === 'TEACHER')
  ) {
    throw new ApplicationError('Forbidden', 403)
  } */
  return feedbackTarget
}

const getFeedbackTargetsForStudent = async (req) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      hidden: false,
    },
    include: getIncludes(req.user.id, 'STUDENT'),
  })
  return feedbackTargets
}

const getOne = async (req, res) => {
  // DO NOT TOUCH THIS
  const startDateBefore = new Date()
  const endDateAfter = dateFns.subDays(new Date(), 180)

  if (useOldImporter) {
    await getEnrolmentByPersonId(req.user.id, {
      startDateBefore,
      endDateAfter,
    })
  }

  const feedbackTarget = await getFeedbackTargetByIdForUser(req)

  if (!feedbackTarget) {
    // admin way
    const adminFeedbackTarget = await FeedbackTarget.findByPk(
      Number(req.params.id),
      {
        include: [
          { model: CourseUnit, as: 'courseUnit' },
          { model: CourseRealisation, as: 'courseRealisation' },
        ],
      },
    )
    const responseReady = await convertFeedbackTargetForAdmin(
      adminFeedbackTarget,
      req.isAdmin,
    )
    res.send(responseReady)
    return
  }

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTarget)
  res.send(responseReady)
}

const update = async (req, res) => {
  const feedbackTarget = req.isAdmin
    ? await FeedbackTarget.findByPk(Number(req.params.id))
    : await getFeedbackTargetByIdForUser(req)
  if (
    !req.isAdmin &&
    feedbackTarget.userFeedbackTargets[0]?.accessStatus !== 'TEACHER'
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
  // DO NOT TOUCH THIS
  const startDateBefore = new Date()
  const endDateAfter = dateFns.subDays(new Date(), 180)

  if (useOldImporter) {
    await getEnrolmentByPersonId(req.user.id, {
      startDateBefore,
      endDateAfter,
    })
  }

  const feedbackTargets = await getFeedbackTargetsForStudent(req)

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

const getCourseUnitsForTeacher = async (req, res) => {
  const { id } = req.user

  if (useOldImporter) {
    await getResponsibleByPersonId(id)
  }

  const courseUnits = await sequelize.query(
    `SELECT DISTINCT(c.*) FROM course_units c, feedback_targets f, user_feedback_targets u ` +
      `WHERE u.feedback_target_id = f.id AND f.course_unit_id = c.id AND u.user_id = '${id}' AND u.access_status = 'TEACHER'`,
    { mapToModel: true, model: CourseUnit },
  )

  res.send(courseUnits)
}

const getTargetsByCourseUnit = async (req, res) => {
  const courseCode = req.params.id

  const feedbackTargets = await FeedbackTarget.findAll({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          userId: req.user.id,
          accessStatus: 'TEACHER',
        },
        include: { model: Feedback, as: 'feedback' },
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        where: {
          courseCode,
        },
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  if (!feedbackTargets)
    throw new ApplicationError('Not found or you do not have access', 404)

  const formattedFeedbackTargets = feedbackTargets.map(
    (target) => target.dataValues,
  )

  const feedbackTargetIds = formattedFeedbackTargets.map(({ id }) => id)

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId: {
        [Op.in]: feedbackTargetIds,
      },
      accessStatus: 'STUDENT',
      feedbackId: {
        [Op.ne]: null,
      },
    },
    group: ['feedbackTargetId'],
    attributes: [
      'feedbackTargetId',
      [sequelize.fn('COUNT', 'feedbackTargetId'), 'feedbackCount'],
      [
        sequelize.literal(
          '(SELECT COUNT(*) FROM user_feedback_targets WHERE feedback_target_id = "UserFeedbackTarget".feedback_target_id)',
        ),
        'enrolledCount',
      ],
      [
        sequelize.literal(
          '(SELECT feedback_response FROM feedback_targets WHERE id = "UserFeedbackTarget".feedback_target_id)',
        ),
        'feedbackResponse',
      ],
    ],
  })
  const feedbackCountByFeedbackTargetId = _.zipObject(
    studentFeedbackTargets.map((target) => target.get('feedbackTargetId')),
    studentFeedbackTargets.map((target) => ({
      feedbackCount: parseInt(target.get('feedbackCount'), 10),
      enrolledCount: parseInt(target.get('enrolledCount'), 10),
      responseGiven: !!target.get('feedbackResponse'),
    })),
  )
  const feedbackTargetsWithFeedbackCounts = formattedFeedbackTargets.map(
    (target) => ({
      ...target,
      feedbackCount:
        feedbackCountByFeedbackTargetId[target.id]?.feedbackCount ?? 0,
      enrolledCount:
        feedbackCountByFeedbackTargetId[target.id]?.enrolledCount ?? 0,
      responseGiven:
        feedbackCountByFeedbackTargetId[target.id]?.responseGiven ?? false,
    }),
  )
  res.send(feedbackTargetsWithFeedbackCounts)
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

  const courseUnitsOrganisation = await CourseUnitsOrganisation.findOne({
    where: {
      courseUnitId: feedbackTarget.courseUnitId,
    },
  })

  const userInfo = await User.findByPk(user.id)
  const userOrganisations = await userInfo.getOrganisationAccess()

  const userHasOrganisationAccess = Boolean(
    userOrganisations.find(
      (org) => org.organisation.id === courseUnitsOrganisation.organisationId,
    ),
  )

  if (!isAdmin) {
    if (
      feedbackTarget.feedbackVisibility === 'NONE' &&
      !userHasOrganisationAccess
    ) {
      return res.send([])
    }

    if (!userFeedbackTarget || userFeedbackTarget.accessStatus === 'STUDENT') {
      // outsider, not in the course
      if (
        feedbackTarget.feedbackVisibility !== 'ALL' &&
        !userHasOrganisationAccess
      ) {
        return res.send([])
      }

      if (!feedbackTarget.isEnded())
        throw new ApplicationError(
          'Information is not available until the feedback period has ended',
          403,
        )
    }
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

  const accessStatus = userFeedbackTarget?.accessStatus
    ? userFeedbackTarget.accessStatus
    : 'STUDENT'

  const publicFeedbacks = await feedbackTarget.getPublicFeedbacks(feedbacks, {
    accessStatus,
    isAdmin,
  })

  return res.send(publicFeedbacks)
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

  const users = studentFeedbackTargets.map((target) => target.user)

  res.send(users)
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

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  feedbackTarget.feedbackResponse = req.body.data
  await feedbackTarget.save()
  res.sendStatus(200)
}

module.exports = {
  getForStudent,
  getCourseUnitsForTeacher,
  getTargetsByCourseUnit,
  getOne,
  update,
  getFeedbacks,
  getStudentsWithFeedback,
  updateFeedbackResponse,
}
