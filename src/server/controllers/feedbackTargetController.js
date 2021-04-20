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
} = require('../models')
const { sequelize } = require('../util/dbConnection')

const mapStatusToValue = {
  STUDENT: 1,
  TEACHER: 2,
}

const asyncFeedbackTargetsToJSON = async (feedbackTargets) => {
  const convertSingle = async (feedbackTarget) => {
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

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTarget)
  res.send(responseReady)
}

const update = async (req, res) => {
  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  feedbackTarget.name = req.body.name
  feedbackTarget.hidden = req.body.hidden
  feedbackTarget.opensAt = req.body.opensAt
  feedbackTarget.closesAt = req.body.closesAt

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
  const courseUnitId = req.params.id

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
          id: courseUnitId,
        },
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTargets)

  res.send(responseReady)
}

// Probably merge this with default response for feedbackTarget
const getSurveys = async (req, res) => {
  const feedbackTarget = await FeedbackTarget.findByPk(req.params.id)

  const surveys = await feedbackTarget.getSurveys()
  res.send(surveys)
}

module.exports = {
  getForStudent,
  getForTeacher,
  getCourseUnitsForTeacher,
  getTargetsByCourseUnit,
  getOne,
  getSurveys,
  update,
}
