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

const defaultQuestions = require('../util/questions.json')

const getOne = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackTargetId: Number(req.params.id),
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        include: [
          { model: CourseUnit, as: 'courseUnit' },
          { model: CourseRealisation, as: 'courseRealisation' },
        ],
        where: {
          hidden: false,
        },
      },
      { model: Feedback, as: 'feedback' },
    ],
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const {
    feedbackId,
    accessStatus,
    feedbackTarget,
    feedback,
  } = userFeedbackTarget
  // TODO get acual questions
  res.send({
    ...feedbackTarget.toJSON(),
    feedbackId,
    feedback,
    accessStatus,
    questions: defaultQuestions,
  })
}

const update = async (req, res) => {
  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  feedbackTarget.name = req.body.name
  feedbackTarget.hidden = req.body.hidden

  await feedbackTarget.save()

  res.sendStatus(200)
}

const getForStudent = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const { id } = user

  const startDateBefore = dateFns.subDays(new Date(), 14)
  const endDateAfter = dateFns.subDays(new Date(), 14)

  await getEnrolmentByPersonId(id, {
    startDateBefore,
    endDateAfter,
  })

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      userId: id,
      accessStatus: 'STUDENT',
    },
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      required: true,
      include: [
        { model: CourseUnit, as: 'courseUnit' },
        { model: CourseRealisation, as: 'courseRealisation' },
      ],
      where: {
        hidden: false,
      },
    },
  })

  const feedbackTargets = userFeedbackTargets.map(
    ({ feedbackTarget, feedbackId, accessStatus }) => ({
      ...feedbackTarget.toJSON(),
      feedbackId,
      accessStatus,
    }),
  )

  res.send(feedbackTargets)
}

const getForTeacher = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const { id } = user

  await getResponsibleByPersonId(id)

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      // userId: id,
      accessStatus: 'TEACHER',
    },
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      required: true,
      include: [
        { model: CourseUnit, as: 'courseUnit' },
        { model: CourseRealisation, as: 'courseRealisation' },
      ],
      /* where: {
        hidden: false,
      }, */
    },
  })

  const feedbackTargets = userFeedbackTargets.map(
    ({ feedbackTarget, feedbackId, accessStatus }) => ({
      ...feedbackTarget.toJSON(),
      feedbackId,
      accessStatus,
    }),
  )

  res.send(feedbackTargets)
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
  const { user } = req

  if (!user) throw new ApplicationError('Missing uid header', 403)

  const courseUnitId = req.params.id

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      required: true,
      include: [
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
    },
  })

  const feedbackTargets = userFeedbackTargets.map(
    ({ feedbackTarget, feedbackId, accessStatus }) => ({
      ...feedbackTarget.toJSON(),
      feedbackId,
      accessStatus,
    }),
  )

  res.send(feedbackTargets)
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
