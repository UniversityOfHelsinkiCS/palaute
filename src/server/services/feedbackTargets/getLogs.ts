import { FeedbackTargetLog, User } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'
import { User as UserType } from '../../models/user'

interface GetLogsParams {
  feedbackTargetId: number
  user: UserType
}

const getLogs = async ({ feedbackTargetId, user }: GetLogsParams) => {
  const { access } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canSeeLogs()) {
    ApplicationError.Forbidden()
  }

  const logs = await FeedbackTargetLog.findAll({
    where: {
      feedbackTargetId,
    },
    include: {
      model: User,
      as: 'user',
    },
    order: [['createdAt', 'DESC']],
  })

  return logs
}

export { getLogs }
