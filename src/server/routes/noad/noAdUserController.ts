import { Response } from 'express'
import { Includeable } from 'sequelize'
import { AuthenticatedRequest } from '../../types'
import { UserFeedbackTarget, FeedbackTarget, CourseUnit, Feedback, CourseRealisation, Organisation } from '../../models'

const getFeedbackTargetsIncludes = (userId: string, accessStatus?: string): Includeable[] => {
  // where parameter cant have undefined values
  const where = accessStatus ? { userId, accessStatus } : { userId }
  return [
    {
      model: UserFeedbackTarget,
      as: 'userFeedbackTargets',
      required: true,
      where,
      include: [{ model: Feedback, as: 'feedback' }],
    },
    {
      model: CourseUnit,
      as: 'courseUnit',
      required: true,
      include: [
        {
          model: Organisation,
          as: 'organisations',
          through: { attributes: [] as string[] },
          required: true,
        },
      ],
    },
    { model: CourseRealisation, as: 'courseRealisation' },
  ]
}

export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req

  if (!user) {
    res.send([])
    return
  }

  const feedbackTargets = await FeedbackTarget.findAll({
    include: getFeedbackTargetsIncludes(user.id, 'STUDENT'),
  })

  const filteredCourses = feedbackTargets.filter(feedbackTarget => feedbackTarget.isOpen())

  res.send(filteredCourses)
}

export const getNoadUser = (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  res.send(user)
}
