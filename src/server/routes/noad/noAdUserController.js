const {
  UserFeedbackTarget,
  FeedbackTarget,
  CourseUnit,
  Feedback,
  CourseRealisation,
  Organisation,
} = require('../../models')

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
  const { user } = req

  if (!user) return res.send([])

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      hidden: false,
    },
    include: getFeedbackTargetsIncludes(user.id, 'STUDENT'),
  })

  const filteredCourses = feedbackTargets.filter(feedbackTarget => feedbackTarget.isOpen())

  return res.send(filteredCourses)
}

const getNoadUser = (req, res) => {
  const { user } = req
  return res.send(user)
}

module.exports = { getCourses, getNoadUser }
