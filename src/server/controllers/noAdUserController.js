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

module.exports = { getCourses }
