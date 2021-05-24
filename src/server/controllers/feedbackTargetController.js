const dateFns = require('date-fns')
const _ = require('lodash')

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
    if (!feedbackTarget) return {}

    await feedbackTarget.populateQuestions()

    const responseReady = feedbackTarget.toJSON()
    const sortedUserFeedbackTargets = responseReady.userFeedbackTargets.sort(
      (a, b) =>
        mapStatusToValue[b.accessStatus] - mapStatusToValue[a.accessStatus],
      // this is intentionally b - a, because we want the max value first
    )
    const relevantUserFeedbackTarget = sortedUserFeedbackTargets[0]
    responseReady.accessStatus = relevantUserFeedbackTarget.accessStatus
    responseReady.feedback = relevantUserFeedbackTarget.feedback
    responseReady.surveys = await feedbackTarget.getSurveys()
    delete responseReady.userFeedbackTargets

    return responseReady
  }

  if (!Array.isArray(feedbackTargets)) return convertSingle(feedbackTargets)

  const responseReady = []

  /* eslint-disable */
  for (const feedbackTarget of feedbackTargets) {
    responseReady.push(await convertSingle(feedbackTarget))
  }
  /* eslint-enable */

  return responseReady
}

const convertFeedbackTargetForAdmin = async (feedbackTargets, isAdmin) => {
  const convertSingle = async (feedbackTarget) => {
    if (!feedbackTarget) return {}

    await feedbackTarget.populateQuestions()

    const responseReady = feedbackTarget.toJSON()
    responseReady.accessStatus = isAdmin ? 'TEACHER' : 'NONE'
    responseReady.feedback = null
    responseReady.surveys = await feedbackTarget.getSurveys()
    delete responseReady.userFeedbackTargets

    return responseReady
  }

  if (!Array.isArray(feedbackTargets)) return convertSingle(feedbackTargets)

  const responseReady = []

  /* eslint-disable */
  for (const feedbackTarget of feedbackTargets) {
    responseReady.push(await convertSingle(feedbackTarget))
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

  await getEnrolmentByPersonId(req.user.id, {
    startDateBefore,
    endDateAfter,
  })

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
  const feedbackTarget = await getFeedbackTargetByIdForUser(req)

  if (feedbackTarget.userFeedbackTargets[0]?.accessStatus !== 'TEACHER')
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

  await getEnrolmentByPersonId(req.user.id, {
    startDateBefore,
    endDateAfter,
  })

  const feedbackTargets = await getFeedbackTargetsForStudent(req)

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

const getCourseUnitsForTeacher = async (req, res) => {
  const { id } = req.user

  await getResponsibleByPersonId(id)

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

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

const filterFeedbacks = async (feedbacks, feedbackTarget, accessStatus) => {
  await feedbackTarget.populateQuestions()
  if (feedbacks.length <= 5) return []
  const { publicQuestionIds } = feedbackTarget
  const filteredFeedbacks = feedbacks.map((feedback) => ({
    ...feedback,
    data: feedback.data.filter((question) => {
      if (accessStatus === 'STUDENT')
        return publicQuestionIds.includes(question.questionId)
      return true
    }),
  }))

  return filteredFeedbacks
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

  if (!isAdmin) {
    if (feedbackTarget.feedbackVisibility === 'NONE') {
      res.send([])
    }

    if (!userFeedbackTarget || userFeedbackTarget.accessStatus === 'STUDENT') {
      // outsider, not in the course
      if (feedbackTarget.feedbackVisibility !== 'ALL') {
        res.send([])
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
  const feedbacks = studentFeedbackTargets.map((t) =>
    t.feedback.toPublicObject(),
  )

  const accessStatus = userFeedbackTarget?.accessStatus
    ? userFeedbackTarget.accessStatus
    : 'STUDENT'
  const publicFeedbacks = isAdmin
    ? feedbacks
    : await filterFeedbacks(feedbacks, feedbackTarget, accessStatus)

  res.send(publicFeedbacks)
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
