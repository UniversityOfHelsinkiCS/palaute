import jwt from 'jsonwebtoken'

import { UserFeedbackTarget, User } from '../../models'
import { JWT_KEY } from '../../util/config'
import { ApplicationError } from '../../util/customErrors'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User as UserType } from '../../models/user'

interface GetStudentTokensParams {
  feedbackTargetId: number
  user: UserType
}

const getStudentTokens = async ({ feedbackTargetId, user }: GetStudentTokensParams) => {
  const { access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeTokens()) ApplicationError.Forbidden()

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      feedbackTargetId,
    },
    include: [
      {
        model: User,
        as: 'user',
        required: true,
      },
    ],
  })

  const users = userFeedbackTargets.map(({ user: student }) => ({
    firstName: student.firstName,
    lastName: student.lastName,
    studentNumber: student.studentNumber,
    token: jwt.sign({ username: student.username }, JWT_KEY),
  }))

  return users
}

export { getStudentTokens }
