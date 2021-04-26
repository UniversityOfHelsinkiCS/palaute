const dateFns = require('date-fns')
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

const getOne = async (req, res) => {
  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id), {
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          userId: req.user.id,
        },
        include: { model: Feedback, as: 'feedback' },
      },
      { model: CourseUnit, as: 'courseUnit' },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  if (!feedbackTarget)
    throw new ApplicationError('Not found or you do not have access', 404)

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTarget)
  res.send(responseReady)
}

const update = async (req, res) => {
  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  const { name, hidden, opensAt, closesAt, questions, surveyId } = req.body

  feedbackTarget.name = name
  feedbackTarget.hidden = hidden
  feedbackTarget.opensAt = opensAt
  feedbackTarget.closesAt = closesAt

  if (questions && surveyId) {
    const survey = await Survey.findByPk(Number(surveyId))
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
  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  await getEnrolmentByPersonId(req.user.id, {
    startDateBefore,
    endDateAfter,
  })

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      hidden: false,
    },
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          userId: req.user.id,
          accessStatus: 'STUDENT',
        },
        include: { model: Feedback, as: 'feedback' },
      },
      { model: CourseUnit, as: 'courseUnit' },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  if (!feedbackTargets)
    throw new ApplicationError('Not found or you do not have access', 404)

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

const getForTeacher = async (req, res) => {
  await getResponsibleByPersonId(req.user.id)

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
      { model: CourseUnit, as: 'courseUnit' },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  if (!feedbackTargets)
    throw new ApplicationError('Not found or you do not have access', 404)

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

const getCourseUnitsForTeacher = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const { id } = user

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
        where: {
          userId: req.user.id,
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

const getFeedbacks = async (req, res) => {
  const { user } = req
  const { id: feedbackTargetId } = req.params

  if (!user) {
    throw new ApplicationError('Authorization is required', 401)
  }

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: req.user.id,
      feedbackTargetId,
    },
    include: 'feedbackTarget',
  })

  // TODO: separate student & teacher access checks
  if (!userFeedbackTarget) {
    throw new ApplicationError('User is not authorized to view feedbacks', 403)
  }

  const { feedbackTarget } = userFeedbackTarget

  await feedbackTarget.populateQuestions()

  const studentFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
    include: 'feedback',
  })

  const feedbacks = studentFeedbackTargets.map((t) =>
    t.feedback.toPublicObject(),
  )

  res.send({
    ...feedbackTarget.toJSON(),
    feedbacks: feedbacks.length < 6 ? [] : feedbacks,
  })
}

module.exports = {
  getForStudent,
  getForTeacher,
  getCourseUnitsForTeacher,
  getTargetsByCourseUnit,
  getOne,
  update,
  getFeedbacks,
}
