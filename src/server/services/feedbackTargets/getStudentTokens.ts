import { UserFeedbackTarget, User } from '../../models'
import { User as UserType } from '../../models/user'
import { ApplicationError } from '../../util/ApplicationError'
import { getNoAdTokenExpirationDate, signNoAdToken } from '../../util/noAdToken'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'

type GetStudentTokensParams = {
  feedbackTargetId: number
  user: UserType
}

const getStudentTokens = async ({ feedbackTargetId, user }: GetStudentTokensParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canSeeTokens()) throw ApplicationError.Forbidden()

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

  const expiresAt = getNoAdTokenExpirationDate(feedbackTarget.closesAt)

  const users = userFeedbackTargets.map(({ user: student }) => ({
    firstName: student?.firstName,
    lastName: student?.lastName,
    studentNumber: student?.studentNumber,
    token: signNoAdToken(student?.username, expiresAt),
  }))

  return users
}

export { getStudentTokens }
