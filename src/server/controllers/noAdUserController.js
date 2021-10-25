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

const getFeedbackTargetsIncludes = (userId, accessStatus) => {
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
          through: { attributes: [] },
          required: true,
        },
      ],
    },
    { model: CourseRealisation, as: 'courseRealisation' },
  ]
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

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      hidden: false,
    },
    include: getFeedbackTargetsIncludes(user.id, 'STUDENT'),
  })

  const filteredCourses = feedbackTargets.filter((feedbackTarget) =>
    feedbackTarget.isOpen(),
  )

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

  console.log(responseReady)

  res.send({ ...responseReady })
}

const getFeedbacks = async (req, res) => {
  const { token } = req.headers
  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

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

  const userOrganisationAccess = await user.hasAccessByOrganisation(
    courseUnit.courseCode,
  )

  const userHasOrganisationAccess = !!userOrganisationAccess

  // Teacher can see feedback any time
  // Admin can see feedback any time
  // Hallinto people can see feedback any time
  if (
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
    isAdmin: false,
    userOrganisationAccess,
  })

  return res.send({
    feedbacks: publicFeedbacks,
    feedbackVisible: true,
    userOrganisationAccess,
  })
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

const deleteFeedback = async (req, res) => {
  const { token } = req.headers
  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findOne({
    where: {
      username,
    },
  })

  const feedback = await getFeedbackForUser(req, user)

  await feedback.destroy()
  res.sendStatus(200)
}

const router = Router()

router.use(noAdAccess)

router.get('/courses', getCourses)
router.get('/feedback-targets/:id', getFeedbackTarget)
router.get('/feedback-targets/:id/feedbacks', getFeedbacks)
router.post('/feedbacks', createFeedback)
router.put('/feedbacks/:id', updateFeedback)
router.delete('/feedbacks/:id', deleteFeedback)

module.exports = router
