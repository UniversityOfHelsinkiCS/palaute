const Router = require('express')

const jwt = require('jsonwebtoken')
const {
  User,
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  Feedback,
  CourseRealisation,
} = require('../models')
const { JWT_KEY } = require('../util/config')
const { ApplicationError } = require('../util/customErrors')

const noAdAccess = async (req, _, next) => {
  const { token } = req.headers

  const username = jwt.decode(token, JWT_KEY)

  const user = await User.findAll({
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

const router = Router()

router.use(noAdAccess)

router.get('/courses', getCourses)

module.exports = router
