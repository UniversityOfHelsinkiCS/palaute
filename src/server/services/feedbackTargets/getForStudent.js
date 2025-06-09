const {
  FeedbackTarget,
  UserFeedbackTarget,
  Feedback,
  CourseUnit,
  Organisation,
  CourseRealisation,
  Summary,
} = require('../../models')

const feedbackTargetToJSON = feedbackTarget => {
  const publicTarget = feedbackTarget.toJSON()

  return {
    ...publicTarget,
    accessStatus: 'STUDENT',
    feedback: feedbackTarget.userFeedbackTargets[0]?.feedback ?? null,
  }
}

const getFeedbackTargetsForStudent = async userId => {
  const feedbackTargets = await FeedbackTarget.findAll({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { userId, accessStatus: 'STUDENT' },
        include: { model: Feedback, as: 'feedback' },
      },
      {
        model: Summary,
        as: 'summary',
        required: false,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        include: [
          {
            model: Organisation,
            as: 'organisations',
            through: { attributes: ['type', 'noFeedbackAllowed'], as: 'courseUnitOrganisation' },
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
      !courseUnit.organisations.some(({ disabledCourseCodes }) => disabledCourseCodes.includes(courseUnit.courseCode))
  )

  return filteredFeedbackTargets.map(feedbackTargetToJSON)
}

const getForStudent = async ({ user }) => {
  const feedbackTargets = await getFeedbackTargetsForStudent(user.id)

  const now = Date.now()

  // userFeedbackTargets table has a unique constraint for user_id <-> feedback_target_id
  // combination so referring to fbt.userFeedbackTargets[0] should be fine
  const grouped = {
    waiting: feedbackTargets.filter(
      fbt =>
        Date.parse(fbt.opensAt) < now &&
        Date.parse(fbt.closesAt) > now &&
        !fbt.feedback &&
        !fbt.userFeedbackTargets[0].notGivingFeedback
    ),
    given: feedbackTargets.filter(fbt => fbt.feedback || fbt.userFeedbackTargets[0].notGivingFeedback),
    ended: feedbackTargets.filter(fbt => Date.parse(fbt.closesAt) < now),
    ongoing: feedbackTargets.filter(fbt => Date.parse(fbt.opensAt) > now),
  }

  return grouped
}

const getWaitingFeedbackCountForStudent = async ({ user }) => {
  const feedbackTargets = await getFeedbackTargetsForStudent(user.id)
  const now = Date.now()

  const count = feedbackTargets.filter(
    fbt => Date.parse(fbt.opensAt) < now && Date.parse(fbt.closesAt) > now && !fbt.feedback
  ).length

  return { count }
}

module.exports = {
  getForStudent,
  getWaitingFeedbackCountForStudent,
}
