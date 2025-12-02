import jwt from 'jsonwebtoken'
import { UserFeedbackTarget } from '../../models'
import { ApplicationError } from '../../util/customErrors'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User } from '../../models/user'

interface EnrollByTokenParams {
  user: User
  token: string
}

const enrollByToken = async ({ user, token }: EnrollByTokenParams) => {
  const decoded = jwt.verify(token, process.env.JWT_KEY as string) as { feedbackTargetId: number }
  const { feedbackTargetId } = decoded

  const { feedbackTarget, userFeedbackTarget } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!feedbackTarget.userCreated)
    return ApplicationError.Forbidden('Only userCreated feedbackTargets can be enrolled to by token')

  if (!feedbackTarget.tokenEnrolmentEnabled)
    return ApplicationError.Forbidden('Token enrolment not enabled for this feedback target')

  if (userFeedbackTarget) {
    if (userFeedbackTarget.accessStatus === 'STUDENT') return ApplicationError.Conflict('User already enrolled')
    return ApplicationError.Conflict('User already is staff on this course')
  }

  const newUserFeedbackTarget = await UserFeedbackTarget.create({
    feedbackTargetId,
    userId: user.id,
    accessStatus: 'STUDENT',
    userCreated: true,
  })

  return newUserFeedbackTarget
}

export { enrollByToken }
