const Router = require('express')

const jwt = require('jsonwebtoken')
const {
  User,
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
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

  const courses = await UserFeedbackTarget.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        where: {
          feedbackType: 'courseRealisation',
        },
        include: {
          model: CourseUnit,
          as: 'courseUnit',
        },
      },
    ],
  })

  //  const filteredCourses = courses.filter((course) => {
  //    course.feedbackTarget.isOpen()
  //  })

  res.send(courses)
}

const router = Router()

router.use(noAdAccess)

router.get('/courses', getCourses)

module.exports = router
