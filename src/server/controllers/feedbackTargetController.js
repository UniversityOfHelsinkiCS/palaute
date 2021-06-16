const dateFns = require('date-fns')
const _ = require('lodash')
const { Op } = require('sequelize')
const { useOldImporter } = require('../util/config')

const { ApplicationError } = require('../util/customErrors')

const { getEnrolmentByPersonId } = require('../util/importerEnrolled')

const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  CourseRealisation,
  Feedback,
  Survey,
  Question,
  User,
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

const getStudentListVisibility = async (courseUnitId) => {
  const organisationRows = await sequelize.query(
    'SELECT O.* from organisations O, course_units_organisations C ' +
      ' WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id LIMIT 1',
    {
      replacements: {
        cuId: courseUnitId,
      },
    },
  )

  if (!organisationRows[0].length) return false

  const { student_list_visible: studentListVisible } = organisationRows[0][0]

  return studentListVisible ?? false
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

const getTargetsByCourseUnit = async (req, res) => {
  const courseCode = req.params.id

  const {
    courseRealisationStartDateAfter,
    courseRealisationStartDateBefore,
    courseRealisationEndDateAfter,
    courseRealisationEndDateBefore,
  } = req.query

  const courseRealisationPeriodWhere = {
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

  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: [
      'id',
      'name',
      'feedbackResponse',
      'courseUnitId',
      'feedbackType',
      'opensAt',
      'closesAt',
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM user_feedback_targets WHERE feedback_target_id = "FeedbackTarget".id AND access_status = 'STUDENT' AND feedback_id IS NOT NULL)`,
        ),
        'feedbackCount',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM user_feedback_targets WHERE feedback_target_id = "FeedbackTarget".id AND access_status = 'STUDENT')`,
        ),
        'enrolledCount',
      ],
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
        include: {
          model: Feedback,
          as: 'feedback',
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
        where: { ...courseRealisationPeriodWhere },
      },
    ],
  })

  if (feedbackTargets.length === 0) {
    return res.send([])
  }

  const studentListVisible = await getStudentListVisibility(
    feedbackTargets[0].courseUnitId,
  )

  const formattedFeedbackTargets = feedbackTargets.map((target) => ({
    ..._.pick(target.toJSON(), [
      'id',
      'name',
      'opensAt',
      'closesAt',
      'feedbackType',
      'courseRealisation',
      'courseUnit',
    ]),
    feedbackCount: parseInt(target.get('feedbackCount'), 10),
    enrolledCount: parseInt(target.get('enrolledCount'), 10),
    feedbackResponseGiven: !!target.get('feedbackResponse'),
    studentListVisible,
  }))

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

  const userHasOrganisationAccess = await user.hasAccessByOrganisation(
    courseUnit.courseCode,
  )

  // Teacher can see feedback any time
  // Admin can see feedback any time
  // Hallinto people can see feedback any time
  if (
    !isAdmin &&
    !userHasOrganisationAccess &&
    !(userFeedbackTarget && userFeedbackTarget.accessStatus === 'TEACHER')
  ) {
    if (!userFeedbackTarget) {
      // outsider, not in the course
      // should only be shown if feedback is public to all
      if (feedbackTarget.feedbackVisibility !== 'ALL') {
        return res.send({
          feedbacks: [],
          feedbackVisible: false,
        })
      }
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

  return res.send({ feedbacks: publicFeedbacks, feedbackVisible: true })
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

  const studentListVisible = await getStudentListVisibility(
    userFeedbackTarget.feedbackTarget.courseUnitId,
  )

  if (!studentListVisible) res.send([])

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
  getTargetsByCourseUnit,
  getOne,
  update,
  getFeedbacks,
  getStudentsWithFeedback,
  updateFeedbackResponse,
}
