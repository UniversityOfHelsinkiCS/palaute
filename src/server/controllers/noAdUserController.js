const Router = require('express')

const jwt = require('jsonwebtoken')
const {
  User,
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  Feedback,
  CourseRealisation,
  Organisation,
} = require('../models')
const { JWT_KEY } = require('../util/config')
const { ApplicationError } = require('../util/customErrors')
const { validateFeedback } = require('../util/feedbackValidator')

const noAdAccess = async (req, _, next) => {
  const { token } = req.headers

  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  if (!user) throw new ApplicationError('No user found', 404)

  return next()
}

const getCourses = async (req, res) => {
  const { token } = req.headers

  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  if (!user) res.send([])

  const courses = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        required: true,
        where: {
          feedbackType: 'courseRealisation',
        },
        include: [
          {
            model: CourseUnit,
            requred: true,
            as: 'courseUnit',
          },
          {
            model: CourseRealisation,
            required: true,
            as: 'courseRealisation',
          },
        ],
      },
      {
        model: Feedback,
        as: 'feedback',
      },
    ],
  })

  const filteredCourses = courses.filter((course) => {
    const { feedbackTarget } = course
    return feedbackTarget.isOpen()
  })

  res.send(filteredCourses)
}

const mapStatusToValue = {
  STUDENT: 1,
  TEACHER: 2,
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

const getIncludes = (user) => {
  const { id } = user

  return [
    {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      required: true,
      where: {
        userId: id,
      },
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
          through: { attributes: [] },
          required: true,
        },
      ],
    },
    { model: CourseRealisation, as: 'courseRealisation' },
  ]
}

const getFeedbackTargetByIdForUser = async (req) => {
  const { token } = req.headers
  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  const feedbackTarget = await FeedbackTarget.findByPk(Number(req.params.id), {
    include: getIncludes(user),
  })

  return feedbackTarget
}

const getFeedbackTarget = async (req, res) => {
  const feedbackTarget = await getFeedbackTargetByIdForUser(req)

  if (!feedbackTarget) return

  const responseReady = await asyncFeedbackTargetsToJSON(feedbackTarget)

  res.send({ ...responseReady })
}

const getFeedbackForUser = async (req, user) => {
  const feedback = await Feedback.findByPk(Number(req.params.id))
  if (!feedback) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: user.id,
    },
  })

  if (!feedbackTarget) throw new ApplicationError('Forbidden', 403)

  return feedback
}

const createFeedback = async (req, res) => {
  const { data, feedbackTargetId } = req.body
  const { token } = req.headers
  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  const feedbackTarget = await FeedbackTarget.findByPk(Number(feedbackTargetId))

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackCanBeGiven = await feedbackTarget.feedbackCanBeGiven()

  if (!feedbackCanBeGiven)
    throw new ApplicationError('Feedback is not open', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId: feedbackTarget.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  if (userFeedbackTarget.feedbackId)
    throw new ApplicationError(
      'Attempt to create new feedback where one already exists. Use PUT to update the old',
      400,
    )

  if (!(await validateFeedback(data, feedbackTarget)))
    throw new ApplicationError('Form data not valid', 400)

  const newFeedback = await Feedback.create({
    data,
    userId: user.id,
  })

  userFeedbackTarget.feedbackId = newFeedback.id
  await userFeedbackTarget.save()

  res.send(newFeedback)
}

const updateFeedback = async (req, res) => {
  const { token } = req.headers
  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  const feedback = await getFeedbackForUser(req, user)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      feedbackId: feedback.id,
      userId: user.id,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const feedbackTarget = await FeedbackTarget.findByPk(
    userFeedbackTarget.feedbackTargetId,
  )

  if (!feedbackTarget) throw new ApplicationError('Not found', 404)

  if (!feedbackTarget.isOpen())
    throw new ApplicationError('Feedback is not open', 403)

  if (!(await validateFeedback(req.body.data, feedbackTarget)))
    throw new ApplicationError('Form data not valid', 400)

  feedback.data = req.body.data

  const updatedFeedback = await feedback.save()

  res.send(updatedFeedback)
}

const router = Router()

router.use(noAdAccess)

router.get('/courses', getCourses)
router.get('/feedback-targets/:id', getFeedbackTarget)
router.post('/feedbacks', createFeedback)
router.put('/feedbacks/:id', updateFeedback)

module.exports = router
