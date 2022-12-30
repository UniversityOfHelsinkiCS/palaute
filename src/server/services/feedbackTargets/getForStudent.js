const {
  FeedbackTarget,
  UserFeedbackTarget,
  Feedback,
  CourseUnit,
  Organisation,
  CourseRealisation,
} = require('../../models')

const feedbackTargetToJSON = (feedbackTarget) => {
  const publicTarget = feedbackTarget.toJSON()

  return {
    ...publicTarget,
    accessStatus: 'STUDENT',
    feedback: feedbackTarget.userFeedbackTargets[0]?.feedback ?? null,
  }
}

const getFeedbackTargetsForStudent = async (userId) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    attributes: {
      exclude: ['feedbackResponse'], // Not needed
    },
    where: {
      hidden: false,
    },
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { userId, accessStatus: 'STUDENT' },
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
            through: { attributes: ['type'], as: 'courseUnitOrganisation' },
            required: true,
          },
        ],
      },
      { model: CourseRealisation, as: 'courseRealisation' },
    ],
  })

  const filteredFeedbackTargets = feedbackTargets.filter(
    ({ courseUnit }) =>
      courseUnit &&
      !courseUnit.organisations.some(({ disabledCourseCodes }) =>
        disabledCourseCodes.includes(courseUnit.courseCode),
      ),
  )

  return filteredFeedbackTargets.map(feedbackTargetToJSON)
}

const getForStudent = async ({ user }) => {
  const feedbackTargets = await getFeedbackTargetsForStudent(user.id)

  const now = Date.now()
  const grouped = {
    waiting: feedbackTargets.filter(
      (fbt) =>
        Date.parse(fbt.opensAt) < now &&
        Date.parse(fbt.closesAt) > now &&
        !fbt.feedback,
    ),
    given: feedbackTargets.filter((fbt) => fbt.feedback),
    ended: feedbackTargets.filter((fbt) => Date.parse(fbt.closesAt) < now),
    ongoing: feedbackTargets.filter((fbt) => Date.parse(fbt.opensAt) > now),
  }

  return grouped
}

module.exports = {
  getForStudent,
}
