import {
  FeedbackTarget,
  UserFeedbackTarget,
  Feedback,
  CourseUnit,
  Organisation,
  CourseRealisation,
  Summary,
} from '../../models'
import { User } from '../../models/user'

const feedbackTargetToJSON = (feedbackTarget: FeedbackTarget) => {
  const publicTarget = feedbackTarget.toJSON()

  return {
    ...publicTarget,
    accessStatus: 'STUDENT',
    feedback: (feedbackTarget.userFeedbackTargets[0] as any)?.feedback ?? null,
  }
}

const getFeedbackTargetsForStudent = async (userId: string) => {
  const feedbackTargets = await FeedbackTarget.findAll({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { userId, accessStatus: 'STUDENT' },
        include: [{ model: Feedback, as: 'feedback' }],
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

interface GetForStudentParams {
  user: User
}

const getForStudent = async ({ user }: GetForStudentParams) => {
  const feedbackTargets = await getFeedbackTargetsForStudent(user.id)

  const now = Date.now()

  // userFeedbackTargets table has a unique constraint for user_id <-> feedback_target_id
  // combination so referring to fbt.userFeedbackTargets[0] should be fine
  const grouped = {
    waiting: feedbackTargets.filter(
      fbt =>
        fbt.opensAt.getTime() < now &&
        fbt.closesAt.getTime() > now &&
        !fbt.feedback &&
        !fbt.userFeedbackTargets[0].notGivingFeedback
    ),
    given: feedbackTargets.filter((fbt: any) => fbt.feedback || fbt.userFeedbackTargets[0].notGivingFeedback),
    ended: feedbackTargets.filter((fbt: any) => Date.parse(fbt.closesAt) < now),
    ongoing: feedbackTargets.filter((fbt: any) => Date.parse(fbt.opensAt) > now),
  }

  return grouped
}

const getWaitingFeedbackCountForStudent = async ({ user }: GetForStudentParams) => {
  const feedbackTargets = await getFeedbackTargetsForStudent(user.id)
  const now = Date.now()

  const count = feedbackTargets.filter(
    (fbt: any) => Date.parse(fbt.opensAt) < now && Date.parse(fbt.closesAt) > now && !fbt.feedback
  ).length

  return { count }
}

export { getForStudent, getWaitingFeedbackCountForStudent }
